import { Swiper } from "swiper";
import { Autoplay, EffectFade, Controller, Navigation } from "swiper/modules";
import noUiSlider from "nouislider";
import Inputmask from "../../../node_modules/inputmask/dist/inputmask.es6.js";

Swiper.use([Autoplay, EffectFade, Controller, Navigation]);

document.addEventListener("DOMContentLoaded", () => {
  const contentEl = document.querySelector(".quest .quiz.swiper");
  const imgEl = document.querySelector(".quest__img.swiper");
  const prevBtn = document.querySelector(".quiz__btn_prev");
  const nextBtn = document.querySelector(".quiz__btn_next");
  const steps = document.querySelector(".quest__steps");
  const spans = steps ? steps.querySelectorAll("span") : [];
  const heroSlider = document.querySelector(".quiz-hero__gallery");

  if (heroSlider) {
    const swiper = new Swiper(heroSlider, {
      loop: true,
      speed: 800,

      autoplay: {
        delay: 3000,
      },
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
    });
  }

  let contentSlider, imgSlider;

  if (contentEl && imgEl) {
    contentSlider = new Swiper(contentEl, {
      loop: false,
      speed: 400,
      spaceBetween: 50,

      on: {
        slideChange: (swiper) => {
          spans[0].textContent = swiper.activeIndex + 1;
        },
      },
    });

    imgSlider = new Swiper(imgEl, {
      loop: false,
      speed: 400,
      effect: "fade",
      fadeEffect: { crossFade: true },
      allowTouchMove: false,
    });

    // link sliders so they move together
    contentSlider.controller.control = imgSlider;
    imgSlider.controller.control = contentSlider;

    // set up step counters
    const total = contentSlider.slides.length;
    if (spans.length >= 2) {
      spans[1].textContent = total;
      spans[0].textContent = contentSlider.activeIndex + 1;
    }

    // apply inputmask to tel inputs inside the quiz form
    const telInputsAll = contentEl.querySelectorAll('input[type="tel"]');
    for (const tel of telInputsAll) {
      try {
        const im = new Inputmask("+7 (999) 999-99-99");
        im.mask(tel);
      } catch (e) {
        // ignore if mask fails
      }
    }

    const slidesEls = Array.from(contentEl.querySelectorAll(".swiper-slide"));

    const isSlideValid = (index) => {
      const slide = slidesEls[index];
      if (!slide) return false;

      // Only validate controls that are explicitly required.
      const requiredEls = slide.querySelectorAll("[required]");
      if (!requiredEls || requiredEls.length === 0) {
        return true; // no required controls -> slide is valid
      }

      // Handle required radio groups: ensure at least one checked per group name
      const requiredRadios = Array.from(requiredEls).filter(
        (el) => el.type === "radio",
      );
      const radioNames = {};
      for (const r of requiredRadios) if (r.name) radioNames[r.name] = true;
      for (const name in radioNames) {
        const group = slide.querySelectorAll(
          `input[type="radio"][name="${name}"]`,
        );
        let ok = false;
        for (const g of group)
          if (g.checked) {
            ok = true;
            break;
          }
        if (!ok) return false;
      }

      // Validate other required elements
      for (const el of requiredEls) {
        const type = el.type;
        if (type === "radio") continue; // already validated
        if (type === "checkbox") {
          if (!el.checked) return false;
          continue;
        }
        if (type === "tel") {
          if (
            el.inputmask &&
            typeof el.inputmask.unmaskedvalue === "function"
          ) {
            if (el.inputmask.unmaskedvalue().length !== 10) return false;
          } else {
            if (!el.value || el.value.trim() === "") return false;
          }
          continue;
        }
        // text, number, textarea
        if (!el.value || el.value.toString().trim() === "") return false;
      }

      // If the year slider is required, it should have attribute data-required
      const yearSliderEl = slide.querySelector("#year-slider");
      if (yearSliderEl && yearSliderEl.hasAttribute("data-required")) {
        if (!yearSliderEl.noUiSlider) return false;
      }

      return true;
    };

    const isLastSlide = () =>
      contentSlider.activeIndex === contentSlider.slides.length - 1;

    const updateNavState = () => {
      const valid = isSlideValid(contentSlider.activeIndex);
      if (nextBtn) {
        if (valid) {
          nextBtn.removeAttribute("disabled");
          nextBtn.classList.remove("is-disabled");
        } else {
          nextBtn.setAttribute("disabled", "");
          nextBtn.classList.add("is-disabled");
        }
        // change text on last slide
        nextBtn.textContent = isLastSlide() ? "отправить" : "далее";
      }
      if (prevBtn) {
        if (contentSlider.activeIndex === 0)
          prevBtn.setAttribute("disabled", "");
        else prevBtn.removeAttribute("disabled");
      }
    };

    // wire custom navigation to control validation
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        contentSlider.slidePrev();
      });
    }

    const submitForm = async () => {
      const form = contentEl.closest("form");
      if (!form) return;
      const action = form.getAttribute("action") || window.location.href;
      const method = (form.getAttribute("method") || "POST").toUpperCase();
      const formData = new FormData(form);
      try {
        await fetch(action, { method, body: formData });
      } catch (err) {
        // ignore network errors, still redirect
      }
      const redirect = form.dataset.page || "/thank";
      window.location.href = redirect;
    };

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const valid = isSlideValid(contentSlider.activeIndex);
        if (!valid) return;
        if (isLastSlide()) {
          submitForm();
        } else {
          contentSlider.slideNext();
        }
      });
    }

    // update nav state on slide change and on input changes
    contentSlider.on("slideChange", updateNavState);

    contentEl.addEventListener("input", updateNavState);
    contentEl.addEventListener("change", updateNavState);

    updateNavState();
  }

  // Initialize noUiSlider if present (year slider in the second slide)
  const yearSliderEl = document.getElementById("year-slider");
  const yearMinEl = document.querySelector(".year-min");
  const yearMaxEl = document.querySelector(".year-max");
  if (yearSliderEl) {
    noUiSlider.create(yearSliderEl, {
      start: [1990, 2026],
      connect: true,
      range: { min: 1990, max: 2026 },
      step: 1,
      format: {
        to: (value) => Math.round(value),
        from: (value) => Number(value),
      },
    });

    yearSliderEl.noUiSlider.on("update", (values) => {
      if (yearMinEl) yearMinEl.textContent = values[0];
      if (yearMaxEl) yearMaxEl.textContent = values[1];
    });
  }
});

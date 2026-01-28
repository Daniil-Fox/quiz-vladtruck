import { Swiper } from "swiper";
import { Autoplay, EffectFade, Controller, Navigation } from "swiper/modules";
import noUiSlider from "nouislider";
import Inputmask from "../../../node_modules/inputmask/dist/inputmask.es6.js";

Swiper.use([Autoplay, EffectFade, Controller, Navigation]);

document.addEventListener("DOMContentLoaded", () => {
  // Fill UTM parameters
  const urlParams = new URLSearchParams(window.location.search);
  const utmFields = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  utmFields.forEach((field) => {
    const el = document.getElementById(field);
    if (el) el.value = urlParams.get(field) || "";
  });

  const contentEl = document.querySelector(".quest .quiz.swiper");
  const imgEl = document.querySelector(".quest__img.swiper");
  const prevBtn = document.querySelector(".quiz__btn_prev");
  const nextBtn = document.querySelector(".quiz__btn_next");
  const steps = document.querySelector(".quest__steps");
  const spans = steps ? steps.querySelectorAll("span") : [];
  const heroSlider = document.querySelector(".quiz-hero__gallery");

  // if (heroSlider) {
  //   const swiper = new Swiper(heroSlider, {
  //     loop: true,
  //     speed: 800,

  //     autoplay: {
  //       delay: 3000,
  //     },
  //     effect: "fade",
  //     fadeEffect: {
  //       crossFade: true,
  //     },
  //   });
  // }

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
        const im = new Inputmask("+7 (999) 999-99-99", {
          // Позволяет вводить номер без маски (например, 79507918999)
          showMaskOnHover: false,
          showMaskOnFocus: false,

          // Обработка ввода без учета маски
          onBeforePaste: function (pastedValue, opts) {
            // Очищаем от всех символов кроме цифр
            let cleaned = pastedValue.replace(/\D/g, "");

            // Если начинается с 8, заменяем на 7
            if (cleaned.startsWith("8")) {
              cleaned = "7" + cleaned.slice(1);
            }

            // Если начинается с 7, убираем её (маска сама добавит +7)
            if (cleaned.startsWith("7")) {
              cleaned = cleaned.slice(1);
            }

            return cleaned;
          },

          onBeforeMask: function (value, opts) {
            // Очищаем от всех символов кроме цифр
            let cleaned = value.replace(/\D/g, "");

            // Если начинается с 8, заменяем на 7
            if (cleaned.startsWith("8")) {
              cleaned = "7" + cleaned.slice(1);
            }

            // Если начинается с 7, убираем её (маска сама добавит +7)
            if (cleaned.startsWith("7")) {
              cleaned = cleaned.slice(1);
            }

            return cleaned;
          },

          // Автоматически подставляем 9 после +7 (
          onKeyValidation: function (key, result) {
            const input = this;
            const currentValue = input.value;

            // Если позиция после "+7 (" и там пусто, подставляем 9
            if (currentValue === "+7 (") {
              setTimeout(() => {
                input.value = "+7 (9";
                // Устанавливаем курсор после 9
                const pos = 5;
                input.setSelectionRange(pos, pos);
              }, 0);
            }
          },
        });

        im.mask(tel);

        // Дополнительный обработчик для автоподстановки 9
        tel.addEventListener("input", function (e) {
          if (this.value === "+7 (") {
            this.value = "+7 (9";
            const pos = 5;
            this.setSelectionRange(pos, pos);
          }
        });

        // Обработка фокуса - если поле пустое, ставим +7 (9
        tel.addEventListener("focus", function (e) {
          if (!this.value || this.value === "+7 (___) ___-__-__") {
            setTimeout(() => {
              this.value = "+7 (9";
              const pos = 5;
              this.setSelectionRange(pos, pos);
            }, 0);
          }
        });
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
      const action = "/mail.php";
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

    // Allow Enter to proceed to next slide or submit
    document.body.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        nextBtn.click();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevBtn.click();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextBtn.click();
      }
    });

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
      // Update hidden inputs
      const minHidden = document.getElementById("year-min-hidden");
      const maxHidden = document.getElementById("year-max-hidden");
      if (minHidden) minHidden.value = values[0];
      if (maxHidden) maxHidden.value = values[1];
    });
  }
});

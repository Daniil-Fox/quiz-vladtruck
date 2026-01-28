<?php
// Файлы phpmailer
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';
require 'phpmailer/Exception.php';

$title = "Тема письма";
$file = $_FILES['file'];

$c = true;
// Формирование самого письма
$title = "Заголовок письма";
foreach ( $_POST as $key => $value ) {
  if ( $value != "" && $key != "project_name" && $key != "admin_email" && $key != "form_subject" ) {
    $body .= "
    " . ( ($c = !$c) ? '<tr>':'<tr style="background-color: #f8f8f8;">' ) . "
      <td style='padding: 10px; border: #e9e9e9 1px solid;'><b>$key</b></td>
      <td style='padding: 10px; border: #e9e9e9 1px solid;'>$value</td>
    </tr>
    ";
  }
}

$body = "<table style='width: 100%;'>$body</table>";

// Настройки PHPMailer
$mail = new PHPMailer\PHPMailer\PHPMailer();

try {
  $mail->isSMTP();
  $mail->CharSet = "UTF-8";
  $mail->SMTPAuth   = true;

  // Настройки вашей почты
  $mail->Host       = 'smtp.gmail.com'; // SMTP сервера вашей почты
  $mail->Username   = ''; // Логин на почте
  $mail->Password   = ''; // Пароль на почте
  $mail->SMTPSecure = 'ssl';
  $mail->Port       = 465;

  $mail->setFrom('', 'Заявка с вашего сайта'); // Адрес самой почты и имя отправителя

  // Получатель письма
  $mail->addAddress('');

  // Прикрипление файлов к письму
  if (!empty($file['name'][0])) {
    for ($ct = 0; $ct < count($file['tmp_name']); $ct++) {
      $uploadfile = tempnam(sys_get_temp_dir(), sha1($file['name'][$ct]));
      $filename = $file['name'][$ct];
      if (move_uploaded_file($file['tmp_name'][$ct], $uploadfile)) {
          $mail->addAttachment($uploadfile, $filename);
          $rfile[] = "Файл $filename прикреплён";
      } else {
          $rfile[] = "Не удалось прикрепить файл $filename";
      }
    }
  }

  // Отправка сообщения
  $mail->isHTML(true);
  $mail->Subject = $title;
  $mail->Body = $body;

  $mail->send();

} catch (Exception $e) {
  $status = "Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}";
}



/* https://api.telegram.org/bot8263624846:AAFSIkGePXQ_nGPcqd8NLyhvu-x9h4B1uCM/getUpdates,
где, 8402362816:AAGfyyaIH_fKSA-TGeFRFAKtWAuBJWSaNuA - токен вашего бота, полученный ранее */


$token = "8263624846:AAFSIkGePXQ_nGPcqd8NLyhvu-x9h4B1uCM";
$chat_id = "-4784174794";


foreach ( $_POST as $key => $value ) {
  if ( $value != "" && $key != "project_name" && $key != "admin_email" && $key != "form_subject" ) {
    $txt .= "<b>".$key."</b> ".$value."%0A";
  }
};


$sendToTelegram = fopen("https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}","r");
// 32083262 - User ID
// AmoCRM integration
// $amoDomain = 'vladtruck.amocrm.ru'; // Замените на ваш домен AmoCRM
// $clientId = 'YOUR_CLIENT_ID'; // Замените на ваш Client ID
// $clientSecret = 'YOUR_CLIENT_SECRET'; // Замените на ваш Client Secret
// $refreshToken = 'YOUR_REFRESH_TOKEN'; // Замените на ваш Refresh Token
// $redirectUri = 'YOUR_REDIRECT_URI'; // Замените на ваш Redirect URI

// function getAccessToken($clientId, $clientSecret, $refreshToken, $redirectUri, $amoDomain) {
//     $url = "https://$amoDomain/oauth2/access_token";
//     $data = [
//         'client_id' => $clientId,
//         'client_secret' => $clientSecret,
//         'grant_type' => 'refresh_token',
//         'refresh_token' => $refreshToken,
//         'redirect_uri' => $redirectUri
//     ];
//     $ch = curl_init();
//     curl_setopt($ch, CURLOPT_URL, $url);
//     curl_setopt($ch, CURLOPT_POST, true);
//     curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
//     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//     $response = curl_exec($ch);
//     curl_close($ch);
//     return json_decode($response, true);
// }

// $tokenData = getAccessToken($clientId, $clientSecret, $refreshToken, $redirectUri, $amoDomain);
// $accessToken = $tokenData['access_token'] ?? '';

// if (!$accessToken) {
//     // Обработка ошибки
//     error_log('Failed to get AmoCRM access token');
// } else {
//     // Сбор всех полей для описания сделки
//     $description = '';
//     foreach ($_POST as $key => $value) {
//         if ($value != "" && $key != "project_name" && $key != "admin_email" && $key != "form_subject") {
//             $description .= "$key: $value\n";
//         }
//     }

//     // Создание контакта и сделки
//     $name = $_POST['name'] ?? 'Не указано';
//     $phone = $_POST['phone'] ?? '';
//     $email = $_POST['email'] ?? ''; // Если есть email поле, иначе пустое
//     createAmoContactAndLead($name, $phone, $email, $description, $amoDomain, $accessToken);
// }

// function createAmoContactAndLead($name, $phone, $email, $description, $amoDomain, $accessToken) {
//     // Создание контакта
//     $contactData = [
//         [
//             "name" => $name,
//             "custom_fields_values" => [
//                 [
//                     "field_id" => 12345, // ID поля телефона, узнайте в AmoCRM (обычно для телефона WORK)
//                     "values" => [["value" => $phone, "enum_code" => "WORK"]]
//                 ],
//                 [
//                     "field_id" => 67890, // ID поля email, узнайте в AmoCRM
//                     "values" => [["value" => $email, "enum_code" => "WORK"]]
//                 ]
//             ]
//         ]
//     ];

//     $ch = curl_init();
//     curl_setopt($ch, CURLOPT_URL, "https://$amoDomain/api/v4/contacts");
//     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//     curl_setopt($ch, CURLOPT_POST, true);
//     curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($contactData));
//     curl_setopt($ch, CURLOPT_HTTPHEADER, [
//         'Authorization: Bearer ' . $accessToken,
//         'Content-Type: application/json'
//     ]);
//     $response = curl_exec($ch);
//     $contact = json_decode($response, true);
//     curl_close($ch);

//     if (!$contact || !isset($contact['_embedded']['contacts'][0]['id'])) {
//         error_log('Failed to create AmoCRM contact: ' . $response);
//         return;
//     }

//     $contactId = $contact['_embedded']['contacts'][0]['id'];

//     // Создание сделки
//     $leadData = [
//         [
//             "name" => "Заявка с сайта",
//             "price" => 0,
//             "description" => $description,
//             "_embedded" => [
//                 "contacts" => [["id" => $contactId]]
//             ]
//         ]
//     ];

//     $ch = curl_init();
//     curl_setopt($ch, CURLOPT_URL, "https://$amoDomain/api/v4/leads");
//     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//     curl_setopt($ch, CURLOPT_POST, true);
//     curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($leadData));
//     curl_setopt($ch, CURLOPT_HTTPHEADER, [
//         'Authorization: Bearer ' . $accessToken,
//         'Content-Type: application/json'
//     ]);
//     $response = curl_exec($ch);
//     curl_close($ch);

//     if (!$response) {
//         error_log('Failed to create AmoCRM lead');
//     }
// }

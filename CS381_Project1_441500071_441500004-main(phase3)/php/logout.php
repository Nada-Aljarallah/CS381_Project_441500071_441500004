<?php
session_start();
$redirect = isset($_SESSION['role']) && $_SESSION['role'] === 'admin' ? '../Pages/admin.html' : '../Pages/login.html';
/* Remove all session variables */
$_SESSION = [];
/* Remove the session cookie */
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}
/* Destroy the session */
session_destroy();
header("Location: $redirect");
exit();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Logging out...</title>
  <meta http-equiv="refresh" content="1; url=../pages/login.html" />
</head>
<body>
  <script>
    window.location.replace('../pages/login.html');
  </script>
  <p>Logging out...</p>
  <p><a href="../pages/login.html">Go to login</a></p>
</body>
</html>

<?php
session_start();
require_once __DIR__ . "/../config/db.php";
function wants_json_response()
{
    return strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";
}
function finish_registration($success, $message, $redirect = "../pages/dashboard.html", $user_data = null)
{
    if (wants_json_response()) {
        header("Content-Type: application/json");
        $response = [
            "success" => $success,
            "message" => $message,
            "redirect" => $redirect
        ];
        if ($user_data !== null) {
            $response["user"] = $user_data;
        }
        echo json_encode($response);
        exit();
    }

    if ($success) {
        header("Location: " . $redirect);
        exit();
    }
    echo htmlspecialchars($message, ENT_QUOTES, "UTF-8");
    exit();
}
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    finish_registration(false, "Invalid request.", "../pages/register.html");
}
$student_id = trim($_POST["student_id"] ?? "");
$name = trim($_POST["name"] ?? "");
$email = trim($_POST["email"] ?? "");
$major = trim($_POST["major"] ?? "");
$date_of_birth = $_POST["date_of_birth"] ?? "";
$password = $_POST["password"] ?? "";
$event_id = trim($_POST["event_id"] ?? "");
if ($student_id === "" || $name === "" || $email === "" || $major === "" || $date_of_birth === "" || $password === "") {
    finish_registration(false, "Please fill in all required fields.", "../pages/register.html");
}
if (strlen($name) < 3) {
    finish_registration(false, "Name must be at least 3 characters long.", "../pages/register.html");
}
if (!preg_match('/^[A-Za-z\s]+$/', $name)) {
    finish_registration(false, "Name should contain only letters.", "../pages/register.html");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    finish_registration(false, "Please enter a valid email address.", "../pages/register.html");
}
if (strlen($password) < 8) {
    finish_registration(false, "Password must be at least 8 characters long.", "../pages/register.html");
}
if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d)/', $password)) {
    finish_registration(false, "Password should include a mix of letters and numbers.", "../pages/register.html");
}
try {
    $pdo->beginTransaction();
    $check = $pdo->prepare("SELECT id, student_id, name, password, role FROM users WHERE student_id = ?");
    $check->execute([$student_id]);
    $user = $check->fetch(PDO::FETCH_ASSOC);
    if ($user) {
        if (!password_verify($password, $user["password"])) {
            $pdo->rollBack();
            finish_registration(false, "An account with this Student ID already exists. Please log in or check your password.", "../pages/login.html");
        }
        $user_id = $user["id"];
        $session_name = $user["name"];
        $role = $user["role"];
    } else {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $assigned_role = 'user';
        $stmt = $pdo->prepare("
            INSERT INTO users (student_id, name, email, major, password, date_of_birth, role)
                VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $student_id,
            $name,
            $email,
            $major,
            $hashed_password,
                $date_of_birth,
                $assigned_role
        ]);
        $user_id = $pdo->lastInsertId();
        $session_name = $name;
            $role = $assigned_role;
    }
    $_SESSION["user_id"] = $user_id;
    $_SESSION["student_id"] = $student_id;
    $_SESSION["user_name"] = $session_name;
    $_SESSION["role"] = $role;
    $_SESSION["authenticated"] = true;
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    $_SESSION["user"] = [
        "id" => $user_id,
        "studentId" => $student_id,
        "name" => $session_name,
        "email" => $email,
        "role" => $role
    ];
    if ($event_id !== "") {
        $registration_check = $pdo->prepare("
            SELECT id FROM registrations
            WHERE student_id = ? AND event_id = ?
        ");
        $registration_check->execute([$student_id, $event_id]);

        if ($registration_check->rowCount() === 0) {
            $registration = $pdo->prepare("
                INSERT INTO registrations (student_id, event_id, registration_date, status)
                VALUES (?, ?, NOW(), 'registered')
            ");
            $registration->execute([$student_id, $event_id]);
        }
    }
    $pdo->commit();

    $message = $event_id !== ""
        ? "Account created and event registration saved."
        : "Account created successfully.";
    $user_data = [
        "studentId" => $student_id,
        "name" => $session_name,
        "csrf_token" => $_SESSION['csrf_token']
    ];
    finish_registration(true, $message, "../pages/dashboard.html", $user_data);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    finish_registration(false, "Could not save registration.", "../pages/register.html");
}
?>
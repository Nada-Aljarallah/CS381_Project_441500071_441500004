<?php
session_start();
require_once __DIR__ . "/../config/db.php";
function wants_json_response()
{
    return strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";
}
function finish_add_user($success, $message)
{
    if (wants_json_response()) {
        header("Content-Type: application/json");
        echo json_encode([
            "success" => $success,
            "message" => $message
        ]);
        exit();
    }

    echo htmlspecialchars($message, ENT_QUOTES, "UTF-8");
    exit();
}
if (!isset($_SESSION["role"]) || $_SESSION["role"] !== "admin") {
    http_response_code(403);
    finish_add_user(false, "Access denied.");
}
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    finish_add_user(false, "Invalid request.");
}
$student_id = trim($_POST["student_id"] ?? "");
$name = trim($_POST["name"] ?? "");
$email = trim($_POST["email"] ?? "");
$major = trim($_POST["major"] ?? "");
$date_of_birth = trim($_POST["date_of_birth"] ?? "");
$password = $_POST["password"] ?? "";
$role = $_POST["role"] ?? "user";
if ($student_id === "" || $name === "" || $email === "" || $major === "" || $date_of_birth === "" || $password === "") {
    finish_add_user(false, "Please fill all fields.");
}
if (strlen($name) < 3) {
    finish_add_user(false, "Name must be at least 3 characters long.");
}
if (!preg_match('/^[A-Za-z\s]+$/', $name)) {
    finish_add_user(false, "Name should contain only letters.");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    finish_add_user(false, "Please enter a valid email address.");
}
if (strlen($password) < 8) {
    finish_add_user(false, "Password must be at least 8 characters long.");
}
if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d)/', $password)) {
    finish_add_user(false, "Password should include a mix of letters and numbers.");
}
$check = $pdo->prepare("SELECT id FROM users WHERE student_id = ?");
$check->execute([$student_id]);
if ($check->rowCount() > 0) {
    finish_add_user(false, "User already exists.");
}
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("
    INSERT INTO users (student_id, name, email, major, password, date_of_birth, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([$student_id, $name, $email, $major, $hashed_password, $date_of_birth, $role]);
finish_add_user(true, "User added successfully.");
?>
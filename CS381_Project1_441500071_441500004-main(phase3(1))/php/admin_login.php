<?php
session_start();
require_once __DIR__ . "/../config/db.php";
header("Content-Type: application/json");
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}
$employee_id = trim($_POST['employee_id'] ?? '');
$password = $_POST['password'] ?? '';
if (empty($employee_id) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please enter ID and password."]);
    exit();
}
// Login check for the single admin in the system
if ($employee_id === 'EMP001' && $password === 'admin123') {
    $_SESSION['role'] = 'admin';
    $_SESSION['employee_id'] = $employee_id;
    $_SESSION['is_admin'] = true;
    echo json_encode(["success" => true, "message" => "Login successful."]);
    exit();
}
echo json_encode(["success" => false, "message" => "Invalid admin credentials."]);
exit();
?>
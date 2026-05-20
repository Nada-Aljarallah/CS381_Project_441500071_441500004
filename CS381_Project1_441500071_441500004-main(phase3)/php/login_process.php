<?php
session_start();
require_once __DIR__ . "/../config/db.php";
header("Content-Type: application/json");
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}
$student_id = trim($_POST['student_id'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($student_id) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please enter Student ID and password."]);
    exit();
}
try {

    $stmt = $pdo->prepare("SELECT id, student_id, name, password, role FROM users WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['student_id'] = $user['student_id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['role'] = $user['role'];
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        echo json_encode([
            "success" => true,
            "message" => "Login successful.",
            "user" => [
                "studentId" => $user['student_id'],
                "name" => $user['name']
            ],
            "csrf_token" => $_SESSION['csrf_token']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid Student ID or password."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error."]);
}
?>
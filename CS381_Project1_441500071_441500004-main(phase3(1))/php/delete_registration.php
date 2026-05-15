<?php
session_start();
require_once __DIR__ . "/../config/db.php";
header("Content-Type: application/json");
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}
$id = $_POST['id'] ?? null;
if (!$id) {
    echo json_encode(["success" => false, "message" => "Registration ID is required."]);
    exit();
}
try {
    $stmt = $pdo->prepare("DELETE FROM registrations WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true, "message" => "Registration deleted successfully."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error."]);
}
?>
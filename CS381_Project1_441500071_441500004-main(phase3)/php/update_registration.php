<?php
session_start();
require_once __DIR__ . "/../config/db.php";
header("Content-Type: application/json");
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}
$registration_id = $_POST['id'] ?? null;
$status = trim($_POST['status'] ?? '');
if (!$registration_id) {
    echo json_encode(["success" => false, "message" => "Registration ID is required."]);
    exit();
}
if (empty($status)) {
    echo json_encode(["success" => false, "message" => "Status is required."]);
    exit();
}
$valid_statuses = ['registered', 'past'];
if (!in_array($status, $valid_statuses)) {
    echo json_encode(["success" => false, "message" => "Invalid status. Must be 'registered' or 'past'."]);
    exit();
}
try {
    $check = $pdo->prepare("SELECT id FROM registrations WHERE id = ?");
    $check->execute([$registration_id]);
    if ($check->rowCount() == 0) {
        echo json_encode(["success" => false, "message" => "Registration not found."]);
        exit();
    }
    $stmt = $pdo->prepare("UPDATE registrations SET status = ? WHERE id = ?");
    $stmt->execute([$status, $registration_id]);
    echo json_encode(["success" => true, "message" => "Registration updated successfully."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error."]);
}
?>
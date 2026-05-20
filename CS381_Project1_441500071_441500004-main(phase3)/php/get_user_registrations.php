<?php
session_start();
require_once __DIR__ . "/../config/db.php";
header("Content-Type: application/json");
$student_id = $_SESSION['student_id'] ?? '';
if (!$student_id) {
    echo json_encode([]);
    exit();
}
try {
    $stmt = $pdo->prepare("
        SELECT 
            r.id, 
            r.event_id AS selectedEventId, 
            r.student_id AS studentId,
            r.status,
            r.registration_date AS registeredAt
        FROM registrations r
        WHERE r.student_id = ?
        ORDER BY r.registration_date DESC
    ");
    $stmt->execute([$student_id]);
    $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($registrations);
} catch (PDOException $e) {
    echo json_encode([]);
}
?>
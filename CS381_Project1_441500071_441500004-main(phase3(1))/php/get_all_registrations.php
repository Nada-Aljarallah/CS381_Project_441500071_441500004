<?php
session_start();
require_once __DIR__ . "/../config/db.php";
header("Content-Type: application/json");
try {
    $stmt = $pdo->query(
        "SELECT
            r.id,
            r.event_id AS selectedEventId,
            r.student_id AS studentId,
            r.status,
            r.registration_date AS registeredAt,
            u.name,
            u.email,
            u.major
        FROM registrations r
        LEFT JOIN users u ON r.student_id = u.student_id
        ORDER BY r.registration_date DESC"
    );
    $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($registrations);
} catch (PDOException $e) {
    echo json_encode([]);
}
?>
<?php
session_start();
header('Content-Type: application/json');
if (isset($_SESSION['student_id'])) {
    $user = [
        'studentId' => $_SESSION['student_id'],
        'name'      => $_SESSION['user_name'] ?? 'User',
        'email'     => $_SESSION['email'] ?? '',
        'role'      => $_SESSION['role'] ?? 'user'
    ];
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
}
?>
<?php
session_start();
header('Content-Type: application/json');
if (!isset($_SESSION['role'])) {
    echo json_encode(['success' => false, 'message' => 'Access denied.']);
    exit;
}

$csrf_token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

// Ensure token is a string to prevent type mismatch errors, and set a 403 status code
if (empty($_SESSION['csrf_token']) || !is_string($csrf_token) || !hash_equals($_SESSION['csrf_token'], $csrf_token)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'CSRF token validation failed.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';
$action = $_POST['action'] ?? '';
if ($action === 'delete') {
    if ($_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Access denied.']);
        exit;
    }
    $student_id = $_POST['student_id'] ?? '';
    if (empty($student_id)) {
        echo json_encode(['success' => false, 'message' => 'Missing user identifier.']);
        exit;
    }
    try {
        $stmtReg = $pdo->prepare('DELETE FROM registrations WHERE student_id = ?');
        $stmtReg->execute([$student_id]);
        
        $stmt = $pdo->prepare('DELETE FROM users WHERE student_id = ?');
        $stmt->execute([$student_id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}
$is_admin = ($_SESSION['role'] === 'admin');
$student_id = $is_admin ? ($_POST['student_id'] ?? '') : $_SESSION['student_id'];
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$major = $_POST['major'] ?? '';
$dob = $_POST['date_of_birth'] ?? '';
$password = $_POST['password'] ?? '';
if (empty($student_id) || empty($name) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}
try {
    $updates = ["name = ?", "email = ?", "major = ?"];
    $params = [$name, $email, $major];
    if (!empty($dob)) { $updates[] = "date_of_birth = ?"; $params[] = $dob; }
    if (!empty($password)) { $updates[] = "password = ?"; $params[] = password_hash($password, PASSWORD_DEFAULT); }
    $params[] = $student_id;
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE student_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    if (!$is_admin) { $_SESSION['user_name'] = $name; } // تحديث اسم الطالب في الموقع
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
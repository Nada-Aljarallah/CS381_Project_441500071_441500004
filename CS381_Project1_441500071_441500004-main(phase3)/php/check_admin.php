<?php
session_start();
header("Content-Type: application/json");
if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
    echo json_encode(["success" => true, "is_admin" => true]);
} else {
    echo json_encode(["success" => true, "is_admin" => false]);
}
?>
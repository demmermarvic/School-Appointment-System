<?php
require_once '../config/database.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $stmt = $pdo->prepare("INSERT INTO announcements (admin_account_number, title, message, date_posted, priority) 
                              VALUES (?, ?, ?, CURDATE(), ?)");
        $stmt->execute([
            $_SESSION['admin_id'],
            $_POST['title'],
            $_POST['text'],
            $_POST['priority']  // Now using the actual priority value
        ]);
        
        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?> 
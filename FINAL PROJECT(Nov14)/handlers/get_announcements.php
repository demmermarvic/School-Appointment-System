<?php
require_once '../config/database.php';

try {
    $stmt = $pdo->query("SELECT a.*, adm.name as admin_name 
                         FROM announcements a 
                         LEFT JOIN admins adm ON a.admin_account_number = adm.account_number 
                         ORDER BY 
                            CASE priority 
                                WHEN 'High' THEN 1 
                                WHEN 'Medium' THEN 2 
                                WHEN 'Low' THEN 3 
                            END, 
                            date_posted DESC");
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($announcements);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?> 
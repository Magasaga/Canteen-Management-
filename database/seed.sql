-- =========================================================================
-- KhabarKoi Campus Canteen System - Initial Dummy Database Seed
-- =========================================================================

-- 1. SEED SUPPLIERS
INSERT INTO suppliers (id, name, code, category, category_title, allowed_items_description, contact_person, phone, supply_hub_counter, active_items_count, rating, logo_url)
VALUES
('brew-cafe', 'Brew Cafe', 'BC-01', 'cafe', 'Cafe, Artisan Coffee & Signature Bakery', 'Exclusively authorized for brewed coffees, espresso drinks, signature cakes, brownies, and cafe bakery items.', 'Arif Mahmud', '+880 1711-209381', 'Main Canteen Counter', 5, 4.90, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=120'),
('khans-kitchen', 'Khans Kitchen', 'KK-02', 'heavy_meals', 'Traditional Heavy Meals & Biryani', 'Exclusively authorized for heavy traditional rice meals: Dhaka Kacchi Biryani, Beef Tehari, Morog Polao, and Bhuna Khichuri.', 'Chef Kabir Khan', '+880 1819-330192', 'Main Canteen Counter', 4, 4.80, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120'),
('olympia', 'Olympia Canteen Kitchen', 'OLY-03', 'heavy_meals', 'Heavy Meals & Lunch Platter Specialties', 'Authorized for heavy meal platters: Hyderabadi Mutton Biryani, Shahi Roast Box, and Oriental Fried Rice combo.', 'Zakir Hossain', '+880 1912-887410', 'Main Canteen Counter', 3, 4.70, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=120'),
('burger-lab', 'Burger Lab & Campus Bites', 'BL-04', 'fast_food', 'Burgers & Fast Food', 'Exclusively authorized for grilled burgers, sliders, loaded nachos, and crispy french fries.', 'Nafis Iqbal', '+880 1622-441908', 'Main Canteen Counter', 6, 4.80, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120'),
('cp-five-star', 'CP Five Star', 'CP-05', 'chicken', 'Chicken Specialties ONLY', 'STRICT AUTHORIZATION: Exclusively CP brand chicken items only (crispy fried chicken, popcorn chicken, spicy wings, chicken sausage, chicken strips). No other products permitted.', 'Sultan Ahmed', '+880 1733-559102', 'Main Canteen Counter', 4, 4.90, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=120'),
('aarong-dairy', 'Aarong Dairy', 'AD-06', 'milk_dairy', 'Milk, Laban & Fresh Dairy Items', 'STRICT AUTHORIZATION: Milk, flavoured laban, sweet curd (doi), cheese slices, paneer roll, and dairy refreshments.', 'Rashedul Islam', '+880 1714-889021', 'Main Canteen Counter', 6, 4.90, 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=120'),
('campus-beverages', 'Campus Beverage Hub', 'CB-07', 'beverage', 'Cold Drinks, Juices & Refreshments', 'Authorized for cold carbonated beverages, mountain dew, chilled juices, mint lemonades, and mineral water.', 'Mahin Chowdhury', '+880 1915-110023', 'Main Canteen Counter', 4, 4.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120');

-- 2. SEED USERS
INSERT INTO users (id, name, email, role, student_id, department, batch, phone, supplier_id, strikes, is_suspended)
VALUES
('std-01', 'Tanvir Rahman', 'tanvir.cse@campus.ac.bd', 'student', '210104082', 'Computer Science & Engineering', 'CSE 21st Batch', '+880 1700-112233', NULL, 0, FALSE),
('std-02', 'Samira Akter', 'samira.bba@campus.ac.bd', 'student', '220102045', 'Business Administration', 'BBA 19th Batch', '+880 1800-445566', NULL, 1, FALSE),
('std-03', 'Fahim Hasan', 'fahim.eee@campus.ac.bd', 'student', '200103019', 'Electrical & Electronic Engineering', 'EEE 20th Batch', '+880 1900-778899', NULL, 3, TRUE),
('emp-01', 'Ratul Karmakar', 'ratul.canteen@campus.ac.bd', 'employee', NULL, 'Canteen Management Operations', NULL, '+880 1722-334455', NULL, 0, FALSE),
('sup-01', 'Brew Cafe Manager', 'supplier.brew@campus.ac.bd', 'supplier', NULL, NULL, NULL, '+880 1711-209381', 'brew-cafe', 0, FALSE),
('sup-02', 'Khans Kitchen Supervisor', 'supplier.khans@campus.ac.bd', 'supplier', NULL, NULL, NULL, '+880 1819-330192', 'khans-kitchen', 0, FALSE),
('sup-05', 'CP Five Star Officer', 'supplier.cp@campus.ac.bd', 'supplier', NULL, NULL, NULL, '+880 1733-559102', 'cp-five-star', 0, FALSE),
('adm-01', 'Campus Proctor & Authority', 'proctor@campus.ac.bd', 'admin', NULL, 'Office of Student Welfare & Canteen Authority', NULL, '+880 1811-998877', NULL, 0, FALSE);

-- 3. SEED FOOD ITEMS (with stock quantities)
INSERT INTO food_items (id, name, description, price, category, supplier_id, supplier_name, image_url, prep_time_minutes, is_available, quantity, rating, review_count, batch_no, supply_date)
VALUES
('bc-cappuccino', 'Signature Velvet Cappuccino', 'Double shot 100% Arabica espresso with rich silky steamed foam and dusted Belgian cocoa.', 130.00, 'Cafe', 'brew-cafe', 'Brew Cafe', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800', 5, TRUE, 22, 4.80, 142, 'BATCH-20261002-BC01', '2026-10-02'),
('bc-signature-cake', 'Brew Signature Dutch Truffle Cake', 'Layered Belgian chocolate sponge coated in glossy 70% dark ganache.', 160.00, 'Cafe', 'brew-cafe', 'Brew Cafe', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', 3, TRUE, 14, 4.95, 230, 'BATCH-20261002-BC01', '2026-10-02'),
('bc-fudge-brownie', 'Warm Sizzling Walnut Brownie', 'Chewy dark chocolate brownie loaded with toasted California walnuts.', 110.00, 'Cafe', 'brew-cafe', 'Brew Cafe', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800', 4, TRUE, 18, 4.85, 95, 'BATCH-20261002-BC01', '2026-10-02'),
('kk-kacchi-biryani', 'Shahi Mutton Kacchi Biryani', 'Aromatic Chinigura rice cooked in sealed copper handi with slow-marinated mutton piece, spiced potato, and boiled egg.', 240.00, 'Heavy Meals', 'khans-kitchen', 'Khans Kitchen', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', 8, TRUE, 4, 4.90, 310, 'BATCH-20261002-KK01', '2026-10-02'),
('kk-beef-tehari', 'Old Dhaka Mustard Beef Tehari', 'Traditional aromatic rice infused with pure cold-pressed mustard oil and tender beef bites.', 170.00, 'Heavy Meals', 'khans-kitchen', 'Khans Kitchen', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800', 6, TRUE, 12, 4.75, 185, 'BATCH-20261002-KK01', '2026-10-02'),
('cp-crispy-chicken', 'CP 5-Star Crispy Fried Chicken (2 Pcs)', 'Signature golden fried chicken thighs, double dipped in CP secret herb crust.', 160.00, 'Chicken', 'cp-five-star', 'CP Five Star', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800', 7, TRUE, 6, 4.90, 290, 'BATCH-20261002-CP01', '2026-10-02'),
('cp-spicy-wings', 'CP Spicy Fiery Wings (4 Pcs)', 'Glazed crispy chicken wings tossed in CP signature spicy peri-chili glaze.', 140.00, 'Chicken', 'cp-five-star', 'CP Five Star', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800', 5, TRUE, 20, 4.80, 160, 'BATCH-20261002-CP01', '2026-10-02'),
('bl-smash-burger', 'Double Smash Beef Burger', 'Dual caramelized beef patties, American cheddar slice, house secret relish, toasted brioche.', 190.00, 'Fast Food', 'burger-lab', 'Burger Lab & Campus Bites', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 10, TRUE, 15, 4.85, 210, 'BATCH-20261002-BL01', '2026-10-02'),
('ad-mango-laban', 'Aarong Chilled Mango Laban (250ml)', 'Creamy fermented probiotic yogurt beverage blended with ripe Rajshahi mango pulp.', 45.00, 'Milk & Dairy', 'aarong-dairy', 'Aarong Dairy', 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=800', 1, TRUE, 35, 4.90, 175, 'BATCH-20261002-AD01', '2026-10-02'),
('cb-mountain-dew', 'Mountain Dew Chilled Can (250ml)', 'Ice-cold citrus carbonated soda.', 35.00, 'Beverages', 'campus-beverages', 'Campus Beverage Hub', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800', 1, TRUE, 40, 4.60, 80, 'BATCH-20261002-CB01', '2026-10-02');

-- 4. SEED ORDERS
INSERT INTO orders (id, token_number, student_id, student_name, student_email, student_batch, student_phone, total_amount, payment_method, payment_status, status, pickup_counter, batch_time, employee_handler_name, notified_student)
VALUES
('ord-101', 'KK-101', 'std-01', 'Tanvir Rahman', 'tanvir.cse@campus.ac.bd', 'Student', '+880 1700-112233', 240.00, 'online', 'paid', 'ready_for_pickup', 'Main Canteen Counter', 'Standard Order', 'Ratul Karmakar', TRUE),
('ord-102', 'KK-102', 'std-02', 'Samira Akter', 'samira.bba@campus.ac.bd', 'BBA 19th Batch', '+880 1800-445566', 290.00, 'hub_cash', 'pay_on_hub_pending', 'preparing', 'Main Canteen Counter', 'Standard Order', 'Ratul Karmakar', FALSE),
('ord-103', 'KK-103', 'std-01', 'Tanvir Rahman', 'tanvir.cse@campus.ac.bd', 'Student', '+880 1700-112233', 160.00, 'online', 'paid', 'collected', 'Main Canteen Counter', 'Standard Order', 'Ratul Karmakar', TRUE);

-- 5. SEED ORDER ITEMS
INSERT INTO order_items (id, order_id, food_item_id, name, price, quantity, batch_no)
VALUES
('oi-101-1', 'ord-101', 'kk-kacchi-biryani', 'Shahi Mutton Kacchi Biryani', 240.00, 1, 'BATCH-20261002-KK01'),
('oi-102-1', 'ord-102', 'bc-cappuccino', 'Signature Velvet Cappuccino', 130.00, 1, 'BATCH-20261002-BC01'),
('oi-102-2', 'ord-102', 'bc-signature-cake', 'Brew Signature Dutch Truffle Cake', 160.00, 1, 'BATCH-20261002-BC01'),
('oi-103-1', 'ord-103', 'cp-crispy-chicken', 'CP 5-Star Crispy Fried Chicken (2 Pcs)', 160.00, 1, 'BATCH-20261002-CP01');

-- 6. SEED RESTOCK REQUESTS
INSERT INTO restock_requests (id, food_item_id, food_item_name, supplier_id, supplier_name, requested_quantity, current_stock, status, requested_by, notes)
VALUES
('req-01', 'kk-kacchi-biryani', 'Shahi Mutton Kacchi Biryani', 'khans-kitchen', 'Khans Kitchen', 50, 4, 'pending', 'Ratul Karmakar', 'Urgent: Lunch rush selling out fast. Please dispatch fresh batch.'),
('req-02', 'cp-crispy-chicken', 'CP 5-Star Crispy Fried Chicken (2 Pcs)', 'cp-five-star', 'CP Five Star', 40, 6, 'pending', 'Ratul Karmakar', 'Afternoon break crowd expected soon.');

-- 7. SEED SUPPLY BATCHES
INSERT INTO supply_batches (id, batch_no, supply_date, supplier_id, supplier_name, food_item_id, item_name, category, quantity, unit, status, hub_notes)
VALUES
('sb-01', 'BATCH-20261002-KK01', '2026-10-02', 'khans-kitchen', 'Khans Kitchen', 'kk-kacchi-biryani', 'Shahi Mutton Kacchi Biryani', 'heavy_meals', 60, 'Portions', 'verified_at_hub', 'Morning dispatch verified, temperature checked at 78C.'),
('sb-02', 'BATCH-20261002-BC01', '2026-10-02', 'brew-cafe', 'Brew Cafe', 'bc-signature-cake', 'Brew Signature Dutch Truffle Cake', 'cafe', 30, 'Portions', 'verified_at_hub', 'Chilled bakery dispatch inspected. Packaging intact.');

-- 8. SEED REVIEWS
INSERT INTO food_reviews (id, food_item_id, food_item_name, student_id, student_name, student_batch, batch_time, batch_no, rating, comment)
VALUES
('rev-01', 'kk-kacchi-biryani', 'Shahi Mutton Kacchi Biryani', 'std-01', 'Tanvir Rahman', 'Student', '1:15 PM Lunch Rush Slot', 'BATCH-20261002-KK01', 5, 'Meat was exceptionally tender and fell right off the bone! Potato was perfectly spiced and fragrant. Arrived freshly prepared and hot.'),
('rev-02', 'bc-signature-cake', 'Brew Signature Dutch Truffle Cake', 'std-02', 'Samira Akter', 'Student', '3:30 PM Tea Break Slot', 'BATCH-20261002-BC01', 5, 'The Belgian dark chocolate ganache is truly gourmet. Brew Cafe never disappoints with their signature cakes. Fresh and delicious.');

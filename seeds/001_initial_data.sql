INSERT INTO products (name, type, amount, price) VALUES
    ('NVIDIA RTX 4090', 'gpu', 10, 1599.99),
    ('NVIDIA RTX 4080', 'gpu', 10, 1199.99),
    ('AMD RX 7900 XTX', 'gpu', 10, 999.99),
    ('Intel Core i9-13900K', 'cpu', 10, 589.99),
    ('AMD Ryzen 9 7950X', 'cpu', 10, 699.99),
    ('ASUS ROG STRIX Z790-E', 'motherboard', 10, 499.99),
    ('MSI MPG B650 CARBON', 'motherboard', 10, 329.99),
    ('Logitech G Pro X Superlight', 'mouse', 10, 159.99),
    ('Razer DeathAdder V3 Pro', 'mouse', 10, 149.99),
    ('SteelSeries Prime', 'mouse', 10, 129.99)
ON CONFLICT DO NOTHING;

INSERT INTO users (name, balance) VALUES
    ('John Gaming Pro', 2500.00),
    ('Alice Tech Enthusiast', 1000.00),
    ('Bob Budget Builder', 500.00),
    ('Sarah Power User', 3000.00)
ON CONFLICT DO NOTHING;

INSERT INTO purchases (user_id, product_id, price_paid)
SELECT 
    u.id as user_id,
    p.id as product_id,
    p.price as price_paid
FROM users u, products p
WHERE u.name = 'John Gaming Pro' 
    AND p.name = 'NVIDIA RTX 4090';

INSERT INTO purchases (user_id, product_id, price_paid)
SELECT 
    u.id as user_id,
    p.id as product_id,
    p.price as price_paid
FROM users u, products p
WHERE u.name = 'Alice Tech Enthusiast' 
    AND p.name = 'AMD Ryzen 9 7950X';

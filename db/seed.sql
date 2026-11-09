INSERT INTO Users (Username, Name, Surname) VALUES
('jkowalski', 'Jan', 'Kowalski'),
('anowak', 'Anna', 'Nowak');

INSERT INTO Recipes (Title, FileName) VALUES
('Naleśniki', 'nalesniki.pdf'),
('Spaghetti bolognese', 'spaghetti.pdf'),
('Szakszuka', 'szakszuka.pdf');

INSERT INTO Ingredients (Name) VALUES
('Mąka'),
('Mleko'),
('Jajka'),
('Makaron spaghetti'),
('Mięso mielone'),
('Pomidory w puszce');

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit) VALUES
(1, 1, 250, 'g'),
(1, 2, 500, 'ml'),
(1, 3, 2, 'szt'),
(2, 4, 400, 'g'),
(2, 5, 500, 'g'),
(2, 6, 1, 'szt'),
(3, 3, 4, 'szt'),
(3, 6, 1, 'szt');

INSERT INTO ShoppingLists (Name, UserID) VALUES
('Zakupy na weekend', 1);

INSERT INTO ShoppingListItems (ShoppingListID, IngredientID, Quantity, Unit, IsChecked) VALUES
(1, 1, 250, 'g', FALSE),
(1, 3, 6, 'szt', TRUE);

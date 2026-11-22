CREATE TABLE Users (
    UserID int PRIMARY KEY AUTO_INCREMENT,
    Username varchar(50) NOT NULL UNIQUE,
    Name varchar(50),
    Surname varchar(50)
);

CREATE TABLE Recipes (
    RecipeID int PRIMARY KEY AUTO_INCREMENT, 
    Title varchar(255) NOT NULL, 
    FileName varchar(255) NOT NULL
);

CREATE TABLE Ingredients (
    IngredientID int PRIMARY KEY AUTO_INCREMENT,
    Name varchar(100) NOT NULL UNIQUE
);

CREATE TABLE RecipeIngredients (
    RecipeID int,
    IngredientID int,
    Quantity decimal(10, 2) NOT NULL,
    Unit varchar(50),
    PRIMARY KEY (RecipeID, IngredientID),
    FOREIGN KEY (RecipeID) REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    FOREIGN KEY (IngredientID) REFERENCES Ingredients(IngredientID) ON DELETE CASCADE
);

CREATE TABLE ShoppingLists (
    ShoppingListID int PRIMARY KEY AUTO_INCREMENT,
    Name varchar(255) NOT NULL DEFAULT 'Lista zakupów',
    UserID int NOT NULL,
    CONSTRAINT fk_UserID FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE ShoppingListItems (
    ItemID int PRIMARY KEY AUTO_INCREMENT,
    ShoppingListID int NOT NULL,
    IngredientID int NOT NULL,
    Quantity decimal(10, 2),
    Unit varchar(50),
    IsChecked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ShoppingListID) REFERENCES ShoppingLists(ShoppingListID) ON DELETE CASCADE,
    FOREIGN KEY (IngredientID) REFERENCES Ingredients(IngredientID) ON DELETE CASCADE
);


INSERT INTO Users (Username, Name, Surname) VALUES
('jkowalski', 'Jan', 'Kowalski'),
('anowak', 'Anna', 'Nowak');

INSERT INTO Recipes (Title, FileName) VALUES
('Naleśniki', 'nalesniki.md'),
('Spaghetti Bolognese', 'spaghetti.md'),
('Szakszuka', 'szakszuka.md');

INSERT INTO Ingredients (Name) VALUES
('Mąka'),
('Mleko'),
('Jajka'),
('Woda'),
('Olej'),
('Sól'),
('Cukier'),
('Wołowina z wieprzowiną'),
('Surowy boczek'),
('Bulion wołowy'),
('Wytrawne białe wino'),
('Pomidory w kawałkach z puszki'),
('Koncentrat pomidorowy'),
('Czosnek'),
('Cebula'),
('Seler naciowy'),
('Marchewka'),
('Oregano'),
('Pieprz'),
('Makaron spaghetti'),
('Parmezan'),
('Listki bazyliii'),
('Pomidory'),
('Masło klarowane'),
('Oliwa'),
('Słodka papryka'),
('Pieprz cayenne'),
('Gałka muszkatołowa'),
('Kumin'),
('Kolendra'),
('Szczypior');

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit) VALUES
(1, 1, 1.5, 'szklanki'),
(1, 2, 1.5, 'szklanki'),
(1, 3, 3, 'szt'),
(1, 4, 1, 'szklanka'),
(1, 5, 1, 'łyżka'),
(1, 6, 2, 'szczypty'),
(1, 7, 1, 'łyżka'),
(2, 8, 500, 'g'),
(2, 9, 200, 'g'),
(2, 10, 1, 'l'),
(2, 11, 0.75, 'szklanki'),
(2, 12, 400, 'g'),
(2, 13, 3, 'łyżki'),
(2, 14, 10, 'g'),
(2, 15, 300, 'g'),
(2, 16, 180, 'g'),
(2, 17, 200, 'g'),
(2, 6, 1, 'łyżeczka'),
(2, 18, 1, 'łyżeczka'),
(2, 19, 1, 'łyżeczka'),
(2, 20, 500, 'g'),
(2, 21, 1, 'szt'),
(2, 22, 10, 'szt'),
(3, 23, 500, 'g'),
(3, 3, 3, 'szt'),
(3, 24, 1, 'łyżka'),
(3, 25, 1, 'łyżka'),
(3, 15, 80, 'g'),
(3, 14, 10, 'g'),
(3, 26, 0.33, 'łyżeczki'),
(3, 27, 1, 'szczypta'),
(3, 28, 1, 'szczypta'),
(3, 29. 1. 'szczypta'),
(3, 30, 1, 'szt'),
(3, 31, 1, 'szt');

INSERT INTO ShoppingLists (Name, UserID) VALUES
('Zakupy na weekend', 1);

INSERT INTO ShoppingListItems (ShoppingListID, IngredientID, Quantity, Unit, IsChecked) VALUES
(1, 1, 250, 'g', FALSE),
(1, 3, 6, 'szt', TRUE);

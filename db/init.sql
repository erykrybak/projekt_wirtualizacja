CREATE TABLE Users (
    UserID int PRIMARY KEY AUTO_INCREMENT,
    Username varchar(50) NOT NULL UNIQUE,
    Name varchar(50),
    Surname varchar(50),
);

CREATE TABLE Recipes (
    RecipeID int PRIMARY KEY AUTO_INCREMENT, 
    Title varchar(255) NOT NULL, 
    FileName varchar(255) NOT NUll
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
    CONSTRAINT fk_UserID FOREIGN KEY (UserID), REFERENCES Users(UserID)
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

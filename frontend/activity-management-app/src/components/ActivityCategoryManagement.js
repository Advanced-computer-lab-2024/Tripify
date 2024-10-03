import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import api from "../services/api";

const ActivityCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getCategories();
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories. Please try again.");
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await api.createCategory({ name: newCategory.trim() });
        setCategories([...categories, response.data]);
        setNewCategory("");
      } catch (error) {
        console.error("Error adding category:", error);
        setError("Failed to add category. Please try again.");
      }
    }
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && editingCategory.name.trim()) {
      try {
        const response = await api.updateCategory(editingCategory._id, {
          name: editingCategory.name.trim(),
        });
        setCategories(
          categories.map((c) =>
            c._id === editingCategory._id ? response.data : c
          )
        );
        setEditingCategory(null);
      } catch (error) {
        console.error("Error updating category:", error);
        setError("Failed to update category. Please try again.");
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category. Please try again.");
    }
  };

  if (loading) return <Typography>Loading categories...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Activity Category Management
        </Typography>
        <TextField
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          variant="outlined"
          margin="normal"
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddCategory}>
          Add Category
        </Button>
        <List>
          {categories.map((category) => (
            <ListItem key={category._id}>
              {editingCategory && editingCategory._id === category._id ? (
                <>
                  <TextField
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                    fullWidth
                  />
                  <Button onClick={handleUpdateCategory}>Save</Button>
                </>
              ) : (
                <>
                  <ListItemText primary={category.name} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => setEditingCategory(category)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </>
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ActivityCategoryManagement;

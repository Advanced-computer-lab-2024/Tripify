import React, { useState, useEffect } from "react";
import axios from "axios";
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

const API_URL = "http://localhost:5000/api/preference-tags";

const PreferenceTagManagement = () => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTags(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching preference tags:", error);
      setError("Failed to fetch preference tags. Please try again.");
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (newTag.trim()) {
      try {
        const response = await axios.post(API_URL, { name: newTag.trim() });
        setTags([...tags, response.data]);
        setNewTag("");
      } catch (error) {
        console.error("Error adding preference tag:", error);
        setError("Failed to add preference tag. Please try again.");
      }
    }
  };

  const handleUpdateTag = async () => {
    if (editingTag && editingTag.name.trim()) {
      try {
        const response = await axios.put(`${API_URL}/${editingTag._id}`, {
          name: editingTag.name.trim(),
        });
        setTags(
          tags.map((t) => (t._id === editingTag._id ? response.data : t))
        );
        setEditingTag(null);
      } catch (error) {
        console.error("Error updating preference tag:", error);
        setError("Failed to update preference tag. Please try again.");
      }
    }
  };

  const handleDeleteTag = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTags(tags.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Error deleting preference tag:", error);
      setError("Failed to delete preference tag. Please try again.");
    }
  };

  if (loading) return <Typography>Loading preference tags...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Preference Tag Management
        </Typography>
        <TextField
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="New tag name"
          variant="outlined"
          margin="normal"
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddTag}>
          Add Preference Tag
        </Button>
        <List>
          {tags.map((tag) => (
            <ListItem key={tag._id}>
              {editingTag && editingTag._id === tag._id ? (
                <>
                  <TextField
                    value={editingTag.name}
                    onChange={(e) =>
                      setEditingTag({ ...editingTag, name: e.target.value })
                    }
                    fullWidth
                  />
                  <Button onClick={handleUpdateTag}>Save</Button>
                </>
              ) : (
                <>
                  <ListItemText primary={tag.name} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => setEditingTag(tag)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteTag(tag._id)}
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

export default PreferenceTagManagement;

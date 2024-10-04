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

const API_URL = "http://localhost:5000/api/tags";

const TagManagement = () => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagPeriod, setNewTagPeriod] = useState("");
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
      console.error("Error fetching tags:", error);
      setError("Failed to fetch tags. Please try again.");
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (newTagName.trim() && newTagPeriod.trim()) {
      try {
        const response = await axios.post(API_URL, {
          name: newTagName.trim(),
          historicalPeriod: newTagPeriod.trim(),
        });
        setTags([...tags, response.data]);
        setNewTagName("");
        setNewTagPeriod("");
      } catch (error) {
        console.error("Error adding tag:", error);
        setError("Failed to add tag. Please try again.");
      }
    }
  };

  const handleDeleteTag = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTags(tags.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Error deleting tag:", error);
      setError("Failed to delete tag. Please try again.");
    }
  };

  if (loading) return <Typography>Loading tags...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Tag Management
        </Typography>
        <TextField
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name"
          variant="outlined"
          margin="normal"
          fullWidth
        />
        <TextField
          value={newTagPeriod}
          onChange={(e) => setNewTagPeriod(e.target.value)}
          placeholder="Historical period"
          variant="outlined"
          margin="normal"
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddTag}>
          Add Tag
        </Button>
        <List>
          {tags.map((tag) => (
            <ListItem key={tag._id}>
              <ListItemText
                primary={tag.name}
                secondary={`Period: ${tag.historicalPeriod}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteTag(tag._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TagManagement;

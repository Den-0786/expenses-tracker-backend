const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to get notes",
    });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Title and content are required",
      });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create note",
    });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content } = req.body;

    const note = await prisma.note.update({
      where: {
        id: parseInt(id),
        userId,
      },
      data: {
        title: title || undefined,
        content: content || undefined,
      },
    });

    res.json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update note",
    });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.note.delete({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete note",
    });
  }
});

module.exports = router;

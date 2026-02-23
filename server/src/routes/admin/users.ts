import { Router } from "express";
import pg from "../../config/db.config";
import { User } from "../../config/entities/User";

const adminUsersRouter = Router();

// GET /api/admin/users - List all users (paginated)
adminUsersRouter.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string;

    const repo = pg.getRepository(User);
    const query = repo
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.email",
        "user.firstName",
        "user.lastName",
        "user.role",
        "user.isActive",
        "user.createdAt",
        "user.profilePicture",
      ])
      .orderBy("user.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.where(
        "LOWER(user.email) LIKE :search OR LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search",
        { search: `%${search.toLowerCase()}%` }
      );
    }

    const [users, total] = await query.getManyAndCount();

    res.json({
      body: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// GET /api/admin/users/:id - Get single user
adminUsersRouter.get("/:id", async (req, res) => {
  try {
    const repo = pg.getRepository(User);
    const user = await repo.findOne({
      where: { id: req.params.id },
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "role",
        "isActive",
        "createdAt",
        "profilePicture",
      ],
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ body: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Error fetching user" });
  }
});

// PATCH /api/admin/users/:id - Update user (role, isActive)
adminUsersRouter.patch("/:id", async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const repo = pg.getRepository(User);

    const user = await repo.findOne({ where: { id: req.params.id } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Prevent self-demotion
    if (req.params.id === req.user!.id) {
      if (role !== undefined && role !== "ROLE_ADMIN") {
        res.status(400).json({ error: "Cannot demote yourself" });
        return;
      }
      if (isActive === false) {
        res.status(400).json({ error: "Cannot deactivate yourself" });
        return;
      }
    }

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await repo.save(user);

    res.json({ body: user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});

// DELETE /api/admin/users/:id - Soft delete user
adminUsersRouter.delete("/:id", async (req, res) => {
  try {
    const repo = pg.getRepository(User);
    const user = await repo.findOne({ where: { id: req.params.id } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Prevent self-deletion
    if (req.params.id === req.user!.id) {
      res.status(400).json({ error: "Cannot delete yourself" });
      return;
    }

    // Soft delete
    user.isActive = false;
    await repo.save(user);

    res.json({ message: "User deactivated" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
});

export default adminUsersRouter;

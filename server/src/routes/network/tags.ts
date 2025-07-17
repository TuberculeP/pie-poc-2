import { Router } from "express";
import pg from "../../config/db.config";
import { Tag } from "../../config/entities/Tag";

const tagsRouter = Router();

tagsRouter.post("/", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        status: 401,
        message: "Login required to create a tag",
      });
      return;
    }

    const tagRepository = pg.getRepository(Tag);
    let { name } = req.body;

    if (!name) {
      res.status(422).json({
        status: 422,
        message: "Missing name",
      });
    }

    let payload = {
      name: name,
    };

    const newTag = tagRepository.create(payload);
    await tagRepository.save(newTag);

    res.status(201).json({
      status: 201,
      message: "Tag successfully created",
      body: newTag,
    });
    return;
  } catch (err) {
    res.json(err);
  }
});

tagsRouter.get("/", async (_, res) => {
  try {
    const tagRepository = pg.getRepository(Tag);
    let allTags = await tagRepository.find({
      order: { name: "ASC" },
    });

    res.status(200).json({
      status: 200,
      message: "Tags successfully retrieved",
      body: allTags,
    });
    return;
  } catch (err) {
    res.json(err);
  }
});

tagsRouter.get("/:id", async (req, res) => {
  try {
    const tagRepository = pg.getRepository(Tag);
    let tag = await tagRepository.findOne({
      where: { id: req.params.id },
    });

    if (!tag) {
      res.status(404).json({
        status: 404,
        message: "Tag not found",
      });
      return;
    }

    res.status(200).json({
      status: 200,
      message: "Tag successfully retrieved",
      body: tag,
    });
    return;
  } catch (err) {
    res.json(err);
  }
});

tagsRouter.patch("/:id", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        status: 401,
        message: "Login required to update a tag",
      });
      return;
    }

    const tagRepository = pg.getRepository(Tag);
    const updates = req.body;

    const tag = await tagRepository.findOne({
      where: { id: req.params.id },
    });

    if (tag) {
      const tagUpdated = await tagRepository.save({ ...tag, ...updates });
      res.status(200).json({
        status: 200,
        message: "Tag successfully updated",
        body: tagUpdated,
      });
      return;
    }

    res.status(404).json({
      status: 404,
      message: "Tag not found",
    });
    return;
  } catch (err) {
    res.json(err);
  }
});

tagsRouter.delete("/:id", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        status: 401,
        message: "Login required to delete a tag",
      });
      return;
    }

    const tagRepository = pg.getRepository(Tag);
    const tag = await tagRepository.findOne({
      where: { id: req.params.id },
    });

    if (tag) {
      await tagRepository.delete(req.params.id);

      res.status(204).json({
        status: 204,
        message: "Tag successfully deleted",
      });
      return;
    }

    res.status(404).json({
      status: 404,
      message: "Tag not found",
    });
    return;
  } catch (err) {
    res.json(err);
  }
});

export default tagsRouter;

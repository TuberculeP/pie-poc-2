import { Router } from "express";
import pg from "../../config/db.config";
import {Post} from "../../config/entities/Post";

const postsRouter = Router();

postsRouter.post("/", async (req, res) => {
    try {
        const postRepository = pg.getRepository(Post)
        let {author, body, tags, comment_of, comments, highlight_on_tag, pinned_by_user} = req.body

        if (!author || !body) {
            res.status(422).json({
                status: 422,
                message: "Missing data",
            })
        }

        let payload = {
            author: author,
            body: body,
            tags: tags,
            comment_of: comment_of,
            comments: comments,
            highlight_on_tag: highlight_on_tag,
            pinned_by_user: pinned_by_user
        }

        const newPost = postRepository.create(payload)
        await postRepository.save(newPost)

        res.status(201).json({
            status: 201,
            message: "Post successfully created",
            body: newPost
        })
    } catch (err) {
        res.json(err)
    }
})

postsRouter.get("/", async (_, res) => {
    try {
        const postRepository = pg.getRepository(Post)
        let allPosts = await postRepository.find({
            order: { createdAt: "DESC" }
        })

        res.status(200).json({
            status: 200,
            message: "Posts successfully retrieved",
            body: allPosts
        })
    } catch (err) {
        res.json(err)
    }
})

postsRouter.get("/:id", async (req, res) => {
    try {
        const postRepository = pg.getRepository(Post)
        let post = await postRepository.findOne({
            where: { id: req.params.id }
        })

        if (!post) {
            res.status(404).json({
                status: 404,
                message: "Post not found",
            })
        }

        res.status(200).json({
            status: 200,
            message: "Post successfully retrieved",
            body: post
        })
    } catch (err) {
        res.json(err)
    }
})

postsRouter.patch("/:id", async (req, res) => {
    try {
        const postRepository = pg.getRepository(Post)
        const updates = req.body

        const post = await postRepository.findOne({
            where: { id: req.params.id }
        })

        if (post) {
            await postRepository.save({...post, ...updates})
            res.status(204).json({
                status: 204,
                message: "Post successfully deleted",
            })
        }

        res.status(404).json({
            status: 404,
            message: "Post not found",
        })

    } catch (err) {
        res.json(err)
    }
})

postsRouter.delete("/:id", async (req, res) => {
    try {
        const postRepository = pg.getRepository(Post)
        const post = await postRepository.findOne({
            where: { id: req.params.id }
        })

        if (post) {
            await postRepository.remove(post)
            res.status(204).json({
                status: 204,
                message: "Post successfully deleted",
            })
        }

        res.status(404).json({
            status: 404,
            message: "Post not found",
        })
    } catch (err) {
        res.json(err)
    }
})

export default postsRouter;

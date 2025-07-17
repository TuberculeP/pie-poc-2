import { Router } from "express";
import pg from "../../config/db.config";
import {Post} from "../../config/entities/Post";
import {User} from "../../config/entities/User";

const postsRouter = Router();

postsRouter.post("/", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            res.status(401).json({
                status: 401,
                message: "Login required to create a post",
                })
            return;
        }

        const postRepository = pg.getRepository(Post)
        const {body, tags, is_highlight, pinned_by_user} = req.body

        if (!body) {
            res.status(422).json({
                status: 422,
                message: "Missing data",
            })
        }

        const userRepository = pg.getRepository(User);
        const author = await userRepository.findOneBy({ id: req.user.id });

        let payload: any = {
            author: author,
            body: body,
            tags: tags,
            is_highlight: is_highlight,
            pinned_by_user: pinned_by_user,
        }

        const newPost = postRepository.create(payload)
        await postRepository.save(newPost)

        res.status(201).json({
            status: 201,
            message: "Post successfully created",
            body: newPost
        })
        return;
    } catch (err) {
        res.json(err)
    }
})

postsRouter.get("/", async (_, res) => {
    try {
        const postRepository = pg.getRepository(Post)
        let allPosts = await postRepository.find({
            order: { createdAt: "DESC" },
            relations: ["author"]
        })

        res.status(200).json({
            status: 200,
            message: "Posts successfully retrieved",
            body: allPosts
        })
        return;
    } catch (err) {
        res.json(err)
    }
})

postsRouter.get("/:id", async (req, res) => {
    try {
        const postRepository = pg.getRepository(Post)
        let post = await postRepository.findOne({
            where: { id: req.params.id },
            relations: ["author"]
        })

        if (!post) {
            res.status(404).json({
                status: 404,
                message: "Post not found",
            })
            return;
        }

        res.status(200).json({
            status: 200,
            message: "Post successfully retrieved",
            body: post,
        })
        return;
    } catch (err) {
        res.json(err)
    }
})

postsRouter.patch("/:id", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            res.status(401).json({
                status: 401,
                message: "User not log",
            })
            return;
        }

        const postRepository = pg.getRepository(Post)
        const updates = req.body

        const post = await postRepository.findOne({
            where: { id: req.params.id },
            relations: ["author"]
        })

        if (post && post.author.id !== req.user.id) {
            res.status(401).json({
                status: 401,
                message: "Not the author of the post",
            })
            return;
        }

        if (post) {
            const postUpdated = await postRepository.save({...post, ...updates})
            res.status(200).json({
                status: 200,
                message: "Post successfully updated",
                body: postUpdated
            })
            return;
        }

        res.status(404).json({
            status: 404,
            message: "Post not found",
        })
        return;
    } catch (err) {
        res.json(err)
    }
})

postsRouter.delete("/:id", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            res.status(401).json({
                status: 401,
                message: "User not log",
            })
            return;
        }

        const postRepository = pg.getRepository(Post)
        const post = await postRepository.findOne({
            where: { id: req.params.id },
            relations: ["author"]
        })

        if (post && post.author.id !== req.user.id) {
            res.status(401).json({
                status: 401,
                message: "Not the author of the post",
            })
            return;
        }

        if (post) {
            /*await postRepository.remove(post)*/
            await postRepository.query(`DELETE FROM post WHERE id = ?`, [req.params.id])

            res.status(204).json({
                status: 204,
                message: "Post successfully deleted",
            })
            return;
        }

        res.status(404).json({
            status: 404,
            message: "Post not found",
        })
        return;
    } catch (err) {
        res.json(err)
    }
})

export default postsRouter;

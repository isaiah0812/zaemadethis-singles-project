import express, { Request, Response } from 'express';

const blog = express();

// TODO developer notes blog implementation
blog.get('/posts', (req: Request, res: Response) => res.send('Getting (short) blog posts!'));
blog.post('/posts', (req: Request, res: Response) => res.send('Posting a blog post!'));
blog.get('/posts/:id', (req: Request, res: Response) => res.send('Getting one blog post!'));
blog.put('/posts/:id', (req: Request, res: Response) => res.send('Updating this blog post!'));
blog.patch('/posts/:id/archive', (req: Request, res: Response) => res.send('Archive this blog post!'));

export default blog;
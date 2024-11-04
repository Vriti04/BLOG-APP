const express = require('express');
const app = express();
app.use(express.json());
const {readUser, writeUser} = require('./user.js');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
app.use(cookieParser());

const { readBlogs, writeBlogs } = require('./blogs.js');  

let isAdmin = false;
const JWT_SECRET_KEY = "vritijaitley";

app.post("/signup", async (req,res)=>{
    const {username, password} = req.body;
    if(username != null || password != null){

    const admin = readUser();

    const maxId = admin.length > 0 ? Math.max(...admin.map(user => parseInt(user.id, 10))) : 0;
    const newId = (maxId + 1);

    const hashedPassword = await bcrypt.hash(password,10);

    if(newId === 1){
        isAdmin = true;
        const newAdmin = {
            id: newId,
            username,
            password:hashedPassword,
            role:'admin'
        }
        admin.push(newAdmin);
        writeUser(admin);
        return res.status(201).json("Success");
    }
    else {
        const user = readUser();
        const maxId = user.length > 0 ? Math.max(...user.map(user => parseInt(user.id, 10))) : 0;
        const newId = (maxId + 1);
        const bl=user.find(a=>a.username === username)
        if(bl){
            return res.status(400).json("User already exists");
        }
        else{

        const newUser = {
            id: newId,
            username,
            password:hashedPassword,
            role:'user'
            
        }
        user.push(newUser);
        writeUser(user);
        return res.status(201).json("Success");
    }
}
}else{
        return res.status(404).json("Check all the fields and ensure that password has an uppercase,lowecase letter and a number");
    }
})

app.post("/login",(req,res)=>{
    const {username, password } = req.body;
    const users = readUser();

    const user = users.find(u=>u.username === username)

    if(!user){
        return res.status(401).json("Invalid credentials");
    }

    //token

    bcrypt.compare(password,user.password, (err,result)=>{
        if(!err){
        const token = jwt.sign(
            {id:user.id, role:user.role},
            JWT_SECRET_KEY,
            {expiresIn:"1h"}
        )

        res.cookie("token", token, {
            httpOnly:true,
            secure:true,
            maxAge:3600000,
        })

        return res.status(200).json({message: "Login Successful", token});

    }else{
        return res.status(404).json("error");
    }
    });

});

function authenticateToken(req,res,next){
    const token = req.cookies["token"];
    if(!token) return res.status(404).json("sorry");
        jwt.verify(token,JWT_SECRET_KEY,(err,decodedUser)=>{
    if(!err){
        const users = readUser();
        const user = users.find((a)=>a.id===decodedUser.id);
        if(user){
            req.user=user;
            next();
        }else{
            return res.status(404).json("sorry");
        }
    }})
}

//admin
app.post("/admin", authenticateToken, async (req,res)=>{
    if(req.user.role!="admin"){
        return res.status(403).json("Access denied, admin only.");
    }
    const {username, password} = req.body;
    if(username != null || password != null){

    const admin = readUser();
    const hashedPassword = await bcrypt.hash(password,10);

    const maxId = admin.length > 0 ? Math.max(...admin.map(user => parseInt(user.id, 10))) : 0;
    const newId = (maxId + 1);
        const newAdmin = {
            id: newId,
            username,
            password:hashedPassword,
            role:'admin'
        }
        admin.push(newAdmin);
        writeUser(admin);
        return res.status(201).json("Success");
    }
});


// Create a new blog post
app.post("/blogs", authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    if (!title || !content) {
        return res.status(400).json("Title and content are required.");
    }

    const blogs = readBlogs();
    const newId = blogs.length > 0 ? Math.max(...blogs.map(blog => blog.id)) + 1 : 1;

    const newBlog = {
        id: newId,
        title,
        content,
        author: { id: userId, username },
        createdAt: new Date().toISOString()
    };

    blogs.push(newBlog);
    writeBlogs(blogs);

    return res.status(201).json("Blog created successfully");
});

// Get all blogs
app.get("/blogs", (req, res) => {
    const blogs = readBlogs();
    res.json(blogs);
});

// Get blog by ID
app.get("/blogs/:id", (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id === blogId);

    if (!blog) {
        return res.status(404).json("Blog not found");
    }

    res.json(blog);
});

app.put("/blogs/:id", authenticateToken, (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const { title, content } = req.body;
    const blogs = readBlogs();
    const blogIndex = blogs.findIndex(b => b.id === blogId);

    if (blogIndex === -1) {
        return res.status(404).json("Blog not found");
    }

    const blog = blogs[blogIndex];
    if (req.user.role !== "admin" && blog.author.id !== req.user.id) {
        return res.status(403).json("You do not have permission to update this blog");
    }

    if (title) blog.title = title;
    if (content) blog.content = content;

    writeBlogs(blogs);
    res.json("Blog updated successfully");
});

// Delete a blog post by ID (only author or admin can delete)
app.delete("/blogs/:id", authenticateToken, (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const blogs = readBlogs();
    const blogIndex = blogs.findIndex(b => b.id === blogId);

    if (blogIndex === -1) {
        return res.status(404).json("Blog not found");
    }

    const blog = blogs[blogIndex];
    if (req.user.role !== "admin" && blog.author.id !== req.user.id) {
        return res.status(403).json("You do not have permission to delete this blog");
    }

    blogs.splice(blogIndex, 1);
    writeBlogs(blogs);
    res.json("Blog deleted successfully");
});

app.listen(3001, (req,res)=>{
    console.log("Server is running :D");
})

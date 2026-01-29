import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile");

    if (!mobile) {
      return NextResponse.json({ error: "Mobile is required" }, { status: 400 });
    }

    const tasks = await Task.find({
      $or: [
        { sender: mobile },
        { "receivers.mobile": mobile }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { sender, senderName, content, receivers, isImportant } = body;

    if (!sender || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTask = await Task.create({
      sender,
      senderName,
      receivers,
      content,
      isImportant: isImportant || content.toLowerCase().includes("important"),
      status: "pending"
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { taskId, status, completedBy } = body;

    if (!taskId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updateData = { status };
    if (status === "done") {
      updateData.completedAt = new Date();
      updateData.completedBy = completedBy;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PUT /api/tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

exports.handler = async (event) => {
  try {
    const method =
      event.requestContext?.http?.method || event.httpMethod;

    if (method === "OPTIONS") {
      return { statusCode: 200, headers, body: "" };
    }

    if (!TABLE_NAME) {
      throw new Error("TABLE_NAME environment variable is missing");
    }

    // GET: Fetch all skills
    if (method === "GET") {
      const result = await db.send(
        new ScanCommand({ TableName: TABLE_NAME })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Items || []),
      };
    }

    // POST: Add a new skill
    if (method === "POST") {
      const skill = JSON.parse(event.body || "{}");

      if (
        !skill.name?.trim() ||
        !skill.category?.trim() ||
        !skill.description?.trim()
      ) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            message: "Name, category and description are required",
          }),
        };
      }

      const newSkill = {
        skillId: randomUUID(),
        name: skill.name.trim(),
        category: skill.category.trim(),
        level: skill.level || "Beginner",
        description: skill.description.trim(),
        teacher: skill.teacher || "Community Member",
        wantsToLearn: skill.wantsToLearn || "",
        availability: skill.availability || "Flexible",
        createdAt: new Date().toISOString(),
      };

      await db.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: newSkill,
        })
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newSkill),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  } catch (error) {
    console.error("SkillBridge API error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Something went wrong with the server",
      }),
    };
  }
};

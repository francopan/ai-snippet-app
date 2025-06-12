import { Box, Button, Heading, Textarea, Flex } from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { Form, redirect, Link } from "@remix-run/react";
import { useState } from "react";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const text = formData.get("text");

  if (typeof text !== "string" || text.trim() === "") {
    throw new Response("Text is required", { status: 400 });
  }

  const response = await fetch(`${process.env.PUBLIC_API_URL}/snippets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Response("Failed to create snippet", { status: response.status });
  }

  const result: { snippet: { _id: string; text: string; summary: string } } = await response.json();

  return redirect(`/${result.snippet._id}`);
};

export default function NewSnippet() {
  const [text, setText] = useState("");

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <Flex mb={4} align="center" justify="space-between">
        <Link to="/">
          <Button size="sm" colorScheme="blue">
            ← Back
          </Button>
        </Link>
      </Flex>

      <Heading as="h1" size="xl" mb={6}>
        Create a New Snippet
      </Heading>

      <Form method="post">
        <Box mb={4}>
          <Textarea
            name="text"
            placeholder="Paste your code or text here..."
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            resize="vertical"
            required
          />
        </Box>

        <Button
          type="submit"
          colorScheme="blue"
          disabled={text.trim() === ""}
          _hover={{ bg: "blue.600" }}
        >
          Submit
        </Button>
      </Form>
    </Box>
  );
}

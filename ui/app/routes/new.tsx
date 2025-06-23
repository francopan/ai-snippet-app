import { Box, Button, Heading, Textarea, Flex, Text } from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { Form, redirect, Link } from "@remix-run/react";
import { useState } from "react";

const MAX_CHARACTERS = 4000;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const text = formData.get("text");

  if (typeof text !== "string" || text.trim() === "") {
    throw new Response("Text is required", { status: 400 });
  }
  const API_URL = process.env.VITE_PUBLIC_API_URL || "";
  const response = await fetch(`${API_URL}/snippets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Response("Failed to create snippet", { status: response.status });
  }

  const result: { id: string; text: string; summary: string } = await response.json();

  return redirect(`/${result.id}`);
};

export default function NewSnippet() {
  const [text, setText] = useState("");
  const isOverLimit = text.length > MAX_CHARACTERS;
  const isEmpty = text.trim() === "";

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
        <Box mb={1}>
          <Textarea
            name="text"
            placeholder="Paste your code or text here..."
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            resize="vertical"
            required
            borderColor={isOverLimit ? "red.500" : undefined}
          />
          <Flex mt={1} justify="space-between">
            <Text fontSize="sm" color={isOverLimit ? "red.500" : "gray.600"}>
              {text.length}/{MAX_CHARACTERS} characters
            </Text>
          </Flex>
          {isOverLimit && (
            <Text fontSize="sm" color="red.500" mt={1}>
              Character limit exceeded. Maximum is {MAX_CHARACTERS} characters.
            </Text>
          )}
        </Box>

        <Button
          mt={2}
          type="submit"
          colorScheme="blue"
          disabled={isEmpty || isOverLimit}
          _hover={{ bg: "blue.600" }}
        >
          Submit
        </Button>
      </Form>
    </Box>
  );
}

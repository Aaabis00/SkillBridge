
const API_URL =
  "https://55ac7nqjjd4bvadkqg2aglxk5q0aluyg.lambda-url.ap-southeast-2.on.aws";

let getAccessToken = () => null;

export function setAccessTokenGetter(tokenGetter) {
  getAccessToken = tokenGetter;
}

async function request(path, options = {}) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Please log in to use SkillBridge.");
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Network or CORS error:", error);
    throw new Error(
      "Could not connect to AWS. Check the browser console and Lambda CORS settings."
    );
  }

  const text = await response.text();
  let result = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    console.error("Non-JSON response from AWS:", {
      status: response.status,
      body: text,
    });

    throw new Error(
      `AWS returned an invalid response (HTTP ${response.status}). Check CloudWatch logs.`
    );
  }

  if (!response.ok) {
    console.error("AWS API error:", {
      path,
      status: response.status,
      response: result,
    });

    // Display the detailed Lambda error during development.
    throw new Error(
      result?.detail ||
      result?.message ||
      `Request failed (${response.status}).`
    );
  }

  return result;
}

export async function getSkills() {
  return request("/skills");
}

export async function addSkill(skill) {
  return request("/skills", {
    method: "POST",
    body: JSON.stringify(skill),
  });
}

export async function deleteSkill(skillId) {
  return request(
    `/skills/${encodeURIComponent(skillId)}`,
    { method: "DELETE" }
  );
}

export async function getRequests() {
  return request("/requests");
}

export async function addRequest(requestData) {
  return request("/requests", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
}

export async function deleteRequest(requestId) {
  return request(
    `/requests/${encodeURIComponent(requestId)}`,
    { method: "DELETE" }
  );
}

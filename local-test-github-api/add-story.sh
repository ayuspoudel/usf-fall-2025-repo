#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 4 ]; then
  echo "Usage: $0 TITLE DUE_DATE COURSE DESCRIPTION"
  echo "Example: $0 \"COP4600 — Midterm Exam\" 2025-10-15 COP4600 \"Midterm covering chapters 1–6. Closed book, 75 minutes.\""
  exit 1
fi

TITLE=$1
DUE_DATE=$2
COURSE=$3
DESCRIPTION=$4

REPO="ayuspoudel/usf-fall-2025-repo"
PROJECT_ID="PVT_kwHOCEjifc4BBXdh"

# Field IDs
DUE_DATE_FIELD="PVTF_lAHOCEjifc4BBXdhzgz5K_Q"
COURSE_FIELD="PVTF_lAHOCEjifc4BBXdhzgz5LAU"
TYPE_FIELD="PVTSSF_lAHOCEjifc4BBXdhzgz5LJs"

# Type option for Exam
EXAM_ID="44a0caf1"

# 1. Create Issue
ISSUE_RESPONSE=$(curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST https://api.github.com/repos/$REPO/issues \
  -d "{\"title\":\"$TITLE\",\"body\":\"$DESCRIPTION\"}")

ISSUE_NODE_ID=$(echo "$ISSUE_RESPONSE" | jq -r '.node_id')
echo "Created issue with node_id: $ISSUE_NODE_ID"

# 2. Add to Project
ITEM_ID=$(curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST https://api.github.com/graphql \
  -d "{\"query\":\"mutation { addProjectV2ItemById(input:{projectId:\\\"$PROJECT_ID\\\", contentId:\\\"$ISSUE_NODE_ID\\\"}) { item { id } } }\"}" \
  | jq -r '.data.addProjectV2ItemById.item.id')

echo "Added to project, item_id: $ITEM_ID"

# 3. Set Due Date
curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST https://api.github.com/graphql \
  -d "{\"query\":\"mutation { updateProjectV2ItemFieldValue(input:{projectId:\\\"$PROJECT_ID\\\", itemId:\\\"$ITEM_ID\\\", fieldId:\\\"$DUE_DATE_FIELD\\\", value:{date:\\\"$DUE_DATE\\\"}}) { projectV2Item { id } } }\"}" >/dev/null

# 4. Set Course
curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST https://api.github.com/graphql \
  -d "{\"query\":\"mutation { updateProjectV2ItemFieldValue(input:{projectId:\\\"$PROJECT_ID\\\", itemId:\\\"$ITEM_ID\\\", fieldId:\\\"$COURSE_FIELD\\\", value:{text:\\\"$COURSE\\\"}}) { projectV2Item { id } } }\"}" >/dev/null

# 5. Set Type = Exam
curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST https://api.github.com/graphql \
  -d "{\"query\":\"mutation { updateProjectV2ItemFieldValue(input:{projectId:\\\"$PROJECT_ID\\\", itemId:\\\"$ITEM_ID\\\", fieldId:\\\"$TYPE_FIELD\\\", value:{singleSelectOptionId:\\\"$EXAM_ID\\\"}}) { projectV2Item { id } } }\"}" >/dev/null

echo "Exam ticket created and fields set."

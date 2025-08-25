#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 4 ]; then
  echo "Usage: $0 ISSUE_NODE_ID DUE_DATE COURSE TYPE"
  echo "Example: $0 I_kwDOPjp5fc7HsrwP 2025-08-25 COP4600 Quiz"
  exit 1
fi

ISSUE_NODE_ID=$1
DUE_DATE=$2
COURSE=$3
TYPE=$4

PROJECT_ID="PVT_kwHOCEjifc4BBXdh"

# Field IDs
DUE_DATE_FIELD="PVTF_lAHOCEjifc4BBXdhzgz5K_Q"
COURSE_FIELD="PVTF_lAHOCEjifc4BBXdhzgz5LAU"
TYPE_FIELD="PVTSSF_lAHOCEjifc4BBXdhzgz5LJs"

# Option IDs for Type
QUIZ_ID="bea76cef"
ASSIGNMENT_ID="b431eaaf"
EXAM_ID="44a0caf1"
PROJECT_OPTION_ID="99ea2747"

case "$TYPE" in
  Quiz) TYPE_OPTION=$QUIZ_ID ;;
  Assignment) TYPE_OPTION=$ASSIGNMENT_ID ;;
  Exam) TYPE_OPTION=$EXAM_ID ;;
  Project) TYPE_OPTION=$PROJECT_OPTION_ID ;;
  *)
    echo "Unknown TYPE: $TYPE (must be Quiz|Assignment|Exam|Project)"
    exit 1
    ;;
esac

ITEM_ID=$(curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST https://api.github.com/graphql \
  -d "{\"query\":\"mutation { addProjectV2ItemById(input:{projectId:\\\"$PROJECT_ID\\\", contentId:\\\"$ISSUE_NODE_ID\\\"}) { item { id } } }\"}" \
  | jq -r '.data.addProjectV2ItemById.item.id')

curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST https://api.github.com/graphql \
  -d "{\"query\":\"mutation { updateProjectV2ItemFieldValue(input:{projectId:\\\"$PROJECT_ID\\\", itemId:\\\"$ITEM_ID\\\", fieldId:\\\"$DUE_DATE_FIELD\\\", value:{date:\\\"$DUE_DATE\\\"}}) { projectV2Item { id } } }\"}" >/dev/null

curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST https://api.github.com/graphql \
  -d "{\"query\":\"mutation { updateProjectV2ItemFieldValue(input:{projectId:\\\"$PROJECT_ID\\\", itemId:\\\"$ITEM_ID\\\", fieldId:\\\"$COURSE_FIELD\\\", value:{text:\\\"$COURSE\\\"}}) { projectV2Item { id } } }\"}" >/dev/null

curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST https://api.github.com/graphql \
  -d "{\"query\":\"mutation { updateProjectV2ItemFieldValue(input:{projectId:\\\"$PROJECT_ID\\\", itemId:\\\"$ITEM_ID\\\", fieldId:\\\"$TYPE_FIELD\\\", value:{singleSelectOptionId:\\\"$TYPE_OPTION\\\"}}) { projectV2Item { id } } }\"}" >/dev/null

echo "Created project item $ITEM_ID with fields set."

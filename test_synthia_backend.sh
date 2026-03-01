#!/bin/bash

# Synthia 3.0 API Testing Script
# Tests all major endpoints

set -e

BASE_URL="${1:-http://localhost:42617}"
RESULTS_FILE="/tmp/synthia_test_results.log"

echo "🧪 Synthia 3.0 API Test Suite"
echo "=============================="
echo "Target: $BASE_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_code="${5:-200}"

    TESTS_RUN=$((TESTS_RUN + 1))

    printf "%-40s ... " "Testing: $name"

    if [ "$method" == "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_code, Got $HTTP_CODE)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    echo "$BODY" >> "$RESULTS_FILE"
    echo "---" >> "$RESULTS_FILE"
}

# Start testing
> "$RESULTS_FILE"

echo -e "${YELLOW}=== Core Endpoints ===${NC}"
test_endpoint "Health Check" "GET" "/health" "" 200
test_endpoint "Service Status" "GET" "/status" "" 200

echo ""
echo -e "${YELLOW}=== LLM & Chat Endpoints ===${NC}"
test_endpoint "Chat Endpoint" "POST" "/chat" \
    '{"messages":[{"role":"user","content":"Hello"}],"language":"es"}' 200

test_endpoint "Switch LLM Provider" "POST" "/switch_llm" \
    '{"provider":"gemma2b"}' 200

echo ""
echo -e "${YELLOW}=== Memory System (mem0) ===${NC}"
test_endpoint "Add Memory" "POST" "/memory/add" \
    '{"user_id":"test_user","content":"Synthia test memory","metadata":{"type":"test"}}' 200

test_endpoint "Retrieve Memories" "POST" "/memory/retrieve" \
    '{"user_id":"test_user","limit":10}' 200

test_endpoint "Search Memories" "POST" "/memory/search" \
    '{"user_id":"test_user","query":"test"}' 200

echo ""
echo -e "${YELLOW}=== Composio Tools ===${NC}"
test_endpoint "List Composio Tools" "GET" "/composio/tools" "" 200

test_endpoint "Execute Composio Tool" "POST" "/composio/execute" \
    '{"tool":"example_tool","args":{"param":"value"}}' 200

echo ""
echo -e "${YELLOW}=== Web Scraping (Firecrawl) ===${NC}"
test_endpoint "Firecrawl Scrape URL" "POST" "/firecrawl/scrape" \
    '{"url":"https://example.com"}' 200

echo ""
echo -e "${YELLOW}=== Kupuri Media Specific ===${NC}"
test_endpoint "Kupuri Research" "POST" "/kupuri/research" \
    '{"topic":"women entrepreneurs","language":"es"}' 200

echo ""
echo -e "${YELLOW}=== Task Delegation (Agent Zero) ===${NC}"
test_endpoint "Delegate Task" "POST" "/task/delegate" \
    '{"title":"Research Task","description":"Find women entrepreneurs in Mexico"}' 200

test_endpoint "Get Task Status" "GET" "/task/status/test_task_id" "" 200

echo ""
echo -e "${YELLOW}=== Audit & Logging ===${NC}"
test_endpoint "Audit Logs" "GET" "/audit/logs" "" 200

echo ""
echo "=============================="
echo -e "📊 Test Results:"
echo -e "  Total Tests: $TESTS_RUN"
echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "Response details saved to: $RESULTS_FILE"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Details:${NC}"
    cat "$RESULTS_FILE"
    exit 1
fi

#!/bin/bash

# Redirect Test Script for Domain Migration
# Tests all domain variations to ensure single-step 301 redirects to canonical domain

CANONICAL="https://www.gamecityelectronics.co.ke"
TEST_URLS=(
  "http://gamecityelectronics.com"
  "https://gamecityelectronics.com"
  "http://www.gamecityelectronics.com"
  "https://www.gamecityelectronics.com"
  "http://gamecityelectronics.co.ke"
  "https://gamecityelectronics.co.ke"
  "http://www.gamecityelectronics.co.ke"
)

echo "=========================================="
echo "Domain Redirect Test Script"
echo "Canonical Domain: $CANONICAL"
echo "=========================================="
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=${#TEST_URLS[@]}

for url in "${TEST_URLS[@]}"; do
  echo "Testing: $url"
  
  # Follow redirects and get final URL and status codes
  response=$(curl -s -I -L -w "\nHTTP_CODE:%{http_code}\nREDIRECT_COUNT:%{num_redirects}\nFINAL_URL:%{url_effective}" "$url" 2>&1)
  
  # Extract information
  http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2 | tr -d ' ')
  redirect_count=$(echo "$response" | grep "REDIRECT_COUNT:" | cut -d: -f2 | tr -d ' ')
  final_url=$(echo "$response" | grep "FINAL_URL:" | cut -d: -f2- | tr -d ' ')
  
  # Get all status codes in the chain
  status_codes=$(echo "$response" | grep -E "^HTTP/" | awk '{print $2}')
  
  echo "  Status Codes: $status_codes"
  echo "  Redirect Count: $redirect_count"
  echo "  Final URL: $final_url"
  
  # Check if redirect count is exactly 1 and final URL is canonical
  if [ "$redirect_count" = "1" ] && [ "$final_url" = "$CANONICAL/" ]; then
    # Check if first status is 301
    first_status=$(echo "$status_codes" | head -n1)
    if [ "$first_status" = "301" ]; then
      echo "  ✅ PASS: Single 301 redirect to canonical"
      ((SUCCESS_COUNT++))
    else
      echo "  ❌ FAIL: First redirect is not 301 (got $first_status)"
      ((FAIL_COUNT++))
    fi
  elif [ "$redirect_count" = "0" ] && [ "$url" = "https://www.gamecityelectronics.co.ke" ]; then
    # Canonical domain should have no redirects
    if [ "$http_code" = "200" ]; then
      echo "  ✅ PASS: Canonical domain returns 200 (no redirect needed)"
      ((SUCCESS_COUNT++))
    else
      echo "  ❌ FAIL: Canonical domain returned $http_code"
      ((FAIL_COUNT++))
    fi
  else
    echo "  ❌ FAIL: Expected 1 redirect to $CANONICAL/"
    echo "           Got $redirect_count redirects, final URL: $final_url"
    ((FAIL_COUNT++))
  fi
  
  echo ""
done

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Total Tests: $TOTAL_TESTS"
echo "✅ Passed: $SUCCESS_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo "🎉 All redirects are working correctly!"
  exit 0
else
  echo "⚠️  Some redirects need attention. Review the output above."
  exit 1
fi


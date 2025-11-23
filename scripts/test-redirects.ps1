# Redirect Test Script for Domain Migration (PowerShell)
# Tests all domain variations to ensure single-step 301 redirects to canonical domain

$CANONICAL = "https://www.gamecityelectronics.co.ke"
$TEST_URLS = @(
    "http://gamecityelectronics.com",
    "https://gamecityelectronics.com",
    "http://www.gamecityelectronics.com",
    "https://www.gamecityelectronics.com",
    "http://gamecityelectronics.co.ke",
    "https://gamecityelectronics.co.ke",
    "http://www.gamecityelectronics.co.ke"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Domain Redirect Test Script" -ForegroundColor Cyan
Write-Host "Canonical Domain: $CANONICAL" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$SUCCESS_COUNT = 0
$FAIL_COUNT = 0
$TOTAL_TESTS = $TEST_URLS.Count

foreach ($url in $TEST_URLS) {
    Write-Host "Testing: $url" -ForegroundColor Yellow
    
    try {
        # Make request and follow redirects
        $response = Invoke-WebRequest -Uri $url -MaximumRedirection 5 -ErrorAction Stop
        
        $statusCode = $response.StatusCode
        $finalUrl = $response.BaseResponse.ResponseUri.AbsoluteUri.TrimEnd('/')
        $redirectCount = $response.RedirectCount
        
        Write-Host "  Status Code: $statusCode" -ForegroundColor Gray
        Write-Host "  Redirect Count: $redirectCount" -ForegroundColor Gray
        Write-Host "  Final URL: $finalUrl" -ForegroundColor Gray
        
        # Check if redirect count is exactly 1 and final URL is canonical
        if ($redirectCount -eq 1 -and $finalUrl -eq $CANONICAL) {
            Write-Host "  ✅ PASS: Single redirect to canonical" -ForegroundColor Green
            $SUCCESS_COUNT++
        }
        elseif ($redirectCount -eq 0 -and $url -eq "https://www.gamecityelectronics.co.ke") {
            # Canonical domain should have no redirects
            if ($statusCode -eq 200) {
                Write-Host "  ✅ PASS: Canonical domain returns 200 (no redirect needed)" -ForegroundColor Green
                $SUCCESS_COUNT++
            }
            else {
                Write-Host "  ❌ FAIL: Canonical domain returned $statusCode" -ForegroundColor Red
                $FAIL_COUNT++
            }
        }
        else {
            Write-Host "  ❌ FAIL: Expected 1 redirect to $CANONICAL" -ForegroundColor Red
            Write-Host "           Got $redirectCount redirects, final URL: $finalUrl" -ForegroundColor Red
            $FAIL_COUNT++
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  ❌ FAIL: Request failed with status $statusCode" -ForegroundColor Red
        Write-Host "           Error: $($_.Exception.Message)" -ForegroundColor Red
        $FAIL_COUNT++
    }
    
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $TOTAL_TESTS"
Write-Host "✅ Passed: $SUCCESS_COUNT" -ForegroundColor Green
Write-Host "❌ Failed: $FAIL_COUNT" -ForegroundColor $(if ($FAIL_COUNT -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($FAIL_COUNT -eq 0) {
    Write-Host "🎉 All redirects are working correctly!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "⚠️  Some redirects need attention. Review the output above." -ForegroundColor Yellow
    exit 1
}


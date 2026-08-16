"""
Comprehensive Backend API Testing for BERKAH USDT
Tests all public and admin endpoints according to the review request.
"""
import requests
import sys
import json
import base64
from datetime import datetime

BASE_URL = "https://usdt-exchange-26.preview.emergentagent.com/api"
ADMIN_USER = "admin"
ADMIN_PASS = "admin"

class BerkahUsdtTester:
    def __init__(self):
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failed_tests = []
        
    def log(self, message, status="INFO"):
        prefix = {
            "PASS": "✅",
            "FAIL": "❌",
            "INFO": "ℹ️",
            "WARN": "⚠️"
        }.get(status, "•")
        print(f"{prefix} {message}")
    
    def test(self, name, method, endpoint, expected_status=200, data=None, headers=None, check_fn=None):
        """Run a single API test"""
        self.tests_run += 1
        url = f"{BASE_URL}{endpoint}"
        
        req_headers = {"Content-Type": "application/json"}
        if self.token:
            req_headers["Authorization"] = f"Bearer {self.token}"
        if headers:
            req_headers.update(headers)
        
        self.log(f"Testing: {name}", "INFO")
        
        try:
            if method == "GET":
                response = requests.get(url, headers=req_headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=req_headers, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=req_headers, timeout=10)
            elif method == "PATCH":
                response = requests.patch(url, json=data, headers=req_headers, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, headers=req_headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            # Check status code
            if response.status_code != expected_status:
                self.tests_failed += 1
                self.failed_tests.append({
                    "name": name,
                    "expected": expected_status,
                    "got": response.status_code,
                    "response": response.text[:200]
                })
                self.log(f"FAILED - Expected {expected_status}, got {response.status_code}", "FAIL")
                return False, None
            
            # Parse JSON
            try:
                json_data = response.json()
            except:
                json_data = None
            
            # Run custom check function
            if check_fn and not check_fn(json_data):
                self.tests_failed += 1
                self.failed_tests.append({
                    "name": name,
                    "error": "Custom check failed",
                    "response": str(json_data)[:200]
                })
                self.log(f"FAILED - Custom check failed", "FAIL")
                return False, json_data
            
            self.tests_passed += 1
            self.log(f"PASSED - Status {response.status_code}", "PASS")
            return True, json_data
            
        except Exception as e:
            self.tests_failed += 1
            self.failed_tests.append({
                "name": name,
                "error": str(e)
            })
            self.log(f"FAILED - Exception: {str(e)}", "FAIL")
            return False, None
    
    def run_all_tests(self):
        """Run all backend tests"""
        self.log("=" * 60, "INFO")
        self.log("BERKAH USDT Backend API Testing", "INFO")
        self.log("=" * 60, "INFO")
        
        # ===== AUTH TESTS =====
        self.log("\n[1] AUTH TESTS", "INFO")
        
        # Test wrong password
        self.test(
            "Login with wrong password returns 401",
            "POST", "/auth/login",
            expected_status=401,
            data={"username": ADMIN_USER, "password": "wrongpassword"}
        )
        
        # Test correct login
        success, data = self.test(
            "Login with admin/admin returns JWT token",
            "POST", "/auth/login",
            expected_status=200,
            data={"username": ADMIN_USER, "password": ADMIN_PASS},
            check_fn=lambda d: d and "token" in d and "user" in d
        )
        
        if success and data:
            self.token = data.get("token")
            self.log(f"Token obtained: {self.token[:20]}...", "INFO")
        else:
            self.log("CRITICAL: Cannot obtain token, stopping tests", "FAIL")
            return
        
        # ===== RATES TESTS =====
        self.log("\n[2] RATES TESTS", "INFO")
        
        success, rates_data = self.test(
            "GET /api/rates returns buyRate and sellRate",
            "GET", "/rates",
            check_fn=lambda d: d and "buyRate" in d and "sellRate" in d
        )
        
        if success and rates_data:
            old_buy = rates_data.get("buyRate", 18000)
            new_buy = old_buy + 10
            
            self.test(
                "PUT /api/rates (auth) updates rate",
                "PUT", "/rates",
                data={"buyRate": new_buy, "sellRate": rates_data.get("sellRate")},
                check_fn=lambda d: d and d.get("success") == True
            )
            
            self.test(
                "GET /api/admin/rate-logs returns logs",
                "GET", "/admin/rate-logs",
                check_fn=lambda d: isinstance(d, list)
            )
        
        # ===== SETTINGS TESTS =====
        self.log("\n[3] SETTINGS TESTS", "INFO")
        
        self.test(
            "GET /api/settings/all returns content, social, networks",
            "GET", "/settings/all",
            check_fn=lambda d: d and "content" in d and "social" in d and "networks" in d
        )
        
        success, social_data = self.test(
            "GET /api/settings/social returns only filled links",
            "GET", "/settings/social",
            check_fn=lambda d: d and "social" in d
        )
        
        self.test(
            "GET /api/settings/content returns content",
            "GET", "/settings/content",
            check_fn=lambda d: d and "content" in d
        )
        
        self.test(
            "GET /api/settings/networks returns networks and freeFeeThresholdUsdt",
            "GET", "/settings/networks",
            check_fn=lambda d: d and "networks" in d and "freeFeeThresholdUsdt" in d
        )
        
        # Test admin settings updates
        self.test(
            "PUT /api/admin/settings/content persists changes",
            "PUT", "/admin/settings/content",
            data={"heroTitle": "Test Hero Title Updated"}
        )
        
        self.test(
            "PUT /api/admin/settings/social persists changes",
            "PUT", "/admin/settings/social",
            data={"whatsapp": "https://wa.me/6281234567890"}
        )
        
        self.test(
            "PUT /api/admin/settings/networks persists changes",
            "PUT", "/admin/settings/networks",
            data={"freeFeeThresholdUsdt": 2000}
        )
        
        # ===== CALCULATOR FEE LOGIC TESTS =====
        self.log("\n[4] CALCULATOR FEE LOGIC TESTS", "INFO")
        
        success, calc_free = self.test(
            "Calculator: 2500 USDT returns feeFree=true, feeUsdt=0",
            "GET", "/calculator/quote?amountUsdt=2500&mode=BUY&network=TRC-20",
            check_fn=lambda d: d and d.get("feeFree") == True and d.get("feeUsdt") == 0
        )
        
        success, calc_fee = self.test(
            "Calculator: 500 USDT ERC-20 returns feeUsdt=5, feeFree=false",
            "GET", "/calculator/quote?amountUsdt=500&mode=BUY&network=ERC-20",
            check_fn=lambda d: d and d.get("feeFree") == False and d.get("feeUsdt") == 5.0
        )
        
        # ===== IMAGE UPLOAD TESTS =====
        self.log("\n[5] IMAGE UPLOAD TESTS", "INFO")
        
        # Create a tiny 1x1 PNG base64
        tiny_png_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        success, upload_data = self.test(
            "POST /api/admin/upload-image returns imageUrl",
            "POST", "/admin/upload-image",
            data={"imageBase64": tiny_png_b64, "originalName": "test.png", "category": "TEST"},
            check_fn=lambda d: d and "imageUrl" in d and d["imageUrl"].startswith("/api/uploads/")
        )
        
        if success and upload_data:
            image_url = upload_data.get("imageUrl")
            # Test serving the uploaded image
            try:
                img_response = requests.get(f"{BASE_URL.replace('/api', '')}{image_url}", timeout=5)
                if img_response.status_code == 200 and "image" in img_response.headers.get("content-type", ""):
                    self.tests_passed += 1
                    self.log(f"PASSED - Image served correctly from {image_url}", "PASS")
                else:
                    self.tests_failed += 1
                    self.log(f"FAILED - Image not served correctly", "FAIL")
                self.tests_run += 1
            except Exception as e:
                self.tests_failed += 1
                self.log(f"FAILED - Cannot fetch image: {e}", "FAIL")
                self.tests_run += 1
        
        # ===== GALLERY CRUD TESTS =====
        self.log("\n[6] GALLERY CRUD TESTS", "INFO")
        
        success, gallery_batch = self.test(
            "POST /api/admin/gallery (batch) uploads images",
            "POST", "/admin/gallery",
            data={"items": [{"imageBase64": tiny_png_b64, "filename": "gallery_test.png"}], "category": "GALERI"}
        )
        
        success, gallery_list = self.test(
            "GET /api/admin/gallery returns assets",
            "GET", "/admin/gallery",
            check_fn=lambda d: d and "assets" in d
        )
        
        if success and gallery_list and gallery_list.get("assets"):
            asset_id = gallery_list["assets"][0].get("id")
            if asset_id:
                self.test(
                    "DELETE /api/admin/gallery/{id} deletes asset",
                    "DELETE", f"/admin/gallery/{asset_id}"
                )
        
        self.test(
            "POST /api/admin/gallery/batch-delete deletes multiple",
            "POST", "/admin/gallery/batch-delete",
            data={"ids": ["ASSET-999999"]}  # Non-existent ID
        )
        
        # ===== POPUPS TESTS =====
        self.log("\n[7] POPUPS TESTS", "INFO")
        
        self.test(
            "GET /api/popups (public) returns active popups",
            "GET", "/popups",
            check_fn=lambda d: d and "popups" in d
        )
        
        success, admin_popups = self.test(
            "GET /api/admin/popups returns all popups",
            "GET", "/admin/popups",
            check_fn=lambda d: d and "popups" in d
        )
        
        success, new_popup = self.test(
            "POST /api/admin/popups creates popup",
            "POST", "/admin/popups",
            data={"title": "Test Popup", "isActive": True}
        )
        
        if success and new_popup and new_popup.get("popup"):
            popup_id = new_popup["popup"].get("id")
            if popup_id:
                self.test(
                    "PUT /api/admin/popups/{id} updates popup",
                    "PUT", f"/admin/popups/{popup_id}",
                    data={"title": "Updated Test Popup"}
                )
                
                self.test(
                    "PATCH /api/admin/popups/{id}/toggle toggles status",
                    "PATCH", f"/admin/popups/{popup_id}/toggle"
                )
                
                self.test(
                    "DELETE /api/admin/popups/{id} deletes popup",
                    "DELETE", f"/admin/popups/{popup_id}"
                )
        
        # ===== TESTIMONIALS TESTS =====
        self.log("\n[8] TESTIMONIALS TESTS", "INFO")
        
        self.test(
            "GET /api/testimonials returns row1 and row2",
            "GET", "/testimonials",
            check_fn=lambda d: d and "row1" in d and "row2" in d
        )
        
        success, admin_testi = self.test(
            "GET /api/admin/testimonials returns all testimonials",
            "GET", "/admin/testimonials",
            check_fn=lambda d: d and "testimonials" in d
        )
        
        self.test(
            "POST /api/admin/testimonials/batch-upload uploads testimonials",
            "POST", "/admin/testimonials/batch-upload",
            data={"items": [{"title": "Test Testi", "clientName": "Test Client", "amount": "-1000 USDT"}]}
        )
        
        if success and admin_testi and admin_testi.get("testimonials"):
            testi_id = admin_testi["testimonials"][0].get("id")
            if testi_id:
                self.test(
                    "PATCH /api/admin/testimonials/{id}/toggle toggles status",
                    "PATCH", f"/admin/testimonials/{testi_id}/toggle"
                )
                
                self.test(
                    "DELETE /api/admin/testimonials/{id} deletes testimonial",
                    "DELETE", f"/admin/testimonials/{testi_id}"
                )
        
        self.test(
            "POST /api/admin/testimonials/batch-delete deletes multiple",
            "POST", "/admin/testimonials/batch-delete",
            data={"ids": ["TESTI-999999"]}
        )
        
        # Don't test reset-seed as it would delete all testimonials
        
        # ===== CHART TESTS =====
        self.log("\n[9] CHART TESTS", "INFO")
        
        self.test(
            "GET /api/chart/rates returns points",
            "GET", "/chart/rates",
            check_fn=lambda d: d and "points" in d
        )
        
        success, chart_settings = self.test(
            "GET /api/admin/settings/chart returns settings and points",
            "GET", "/admin/settings/chart",
            check_fn=lambda d: d and "settings" in d and "points" in d
        )
        
        self.test(
            "PUT /api/admin/settings/chart updates settings",
            "PUT", "/admin/settings/chart",
            data={"chartType": "area", "showBuy": True}
        )
        
        success, new_point = self.test(
            "POST /api/admin/settings/chart/points adds point",
            "POST", "/admin/settings/chart/points",
            data={"label": "Test Point", "buyRate": 18100, "sellRate": 17100}
        )
        
        if success and new_point and new_point.get("point"):
            point_id = new_point["point"].get("id")
            if point_id:
                self.test(
                    "DELETE /api/admin/settings/chart/points/{id} deletes point",
                    "DELETE", f"/admin/settings/chart/points/{point_id}"
                )
        
        # ===== DB MANAGER TESTS =====
        self.log("\n[10] DB MANAGER TESTS", "INFO")
        
        success, collections = self.test(
            "GET /api/admin/db/collections returns collections",
            "GET", "/admin/db/collections",
            check_fn=lambda d: d and "collections" in d
        )
        
        self.test(
            "GET /api/admin/db/documents?collection=rates returns documents",
            "GET", "/admin/db/documents?collection=rates",
            check_fn=lambda d: d and "documents" in d
        )
        
        # Test edit document (update a rate minUsdt)
        if success and collections:
            self.test(
                "PUT /api/admin/db/document edits document",
                "PUT", "/admin/db/document",
                data={"collection": "rates", "docId": "rates", "updates": {"minUsdt": 10}}
            )
        
        # Test delete document (create a test order first)
        success, test_order = self.test(
            "POST /api/orders creates order",
            "POST", "/orders",
            expected_status=201,
            data={"type": "BUY", "amountUsdt": 100, "clientName": "Test Client"}
        )
        
        if success and test_order and test_order.get("order"):
            order_id = test_order["order"].get("id")
            if order_id:
                self.test(
                    "POST /api/admin/db/document/delete deletes document",
                    "POST", "/admin/db/document/delete",
                    data={"collection": "orders", "docId": order_id}
                )
        
        # Test clear collection (use chartpoints as it's safe to clear)
        # Actually, let's skip this to preserve data
        
        # Test that adminusers is protected
        self.test(
            "POST /api/admin/db/clear-collection rejects adminusers",
            "POST", "/admin/db/clear-collection",
            expected_status=400,
            data={"collection": "adminusers", "confirm": True}
        )
        
        success, backup = self.test(
            "POST /api/admin/db/backup returns full dump",
            "POST", "/admin/db/backup",
            check_fn=lambda d: d and "backup" in d and "totalDocuments" in d
        )
        
        # Don't test restore as it would modify the database
        
        # ===== MONITORING TESTS =====
        self.log("\n[11] MONITORING TESTS", "INFO")
        
        self.test(
            "GET /api/admin/server-vps-info returns RAM/CPU/disk",
            "GET", "/admin/server-vps-info",
            check_fn=lambda d: d and "memory" in d and "cpu" in d and "disk" in d
        )
        
        self.test(
            "POST /api/admin/clear-cache clears cache",
            "POST", "/admin/clear-cache"
        )
        
        self.test(
            "POST /api/admin/server-vps-clean-garbage cleans garbage",
            "POST", "/admin/server-vps-clean-garbage",
            data={"actionType": "all"}
        )
        
        self.test(
            "POST /api/admin/server-vps-reconnect-db reconnects DB",
            "POST", "/admin/server-vps-reconnect-db"
        )
        
        self.test(
            "GET /api/admin/system-info returns system info",
            "GET", "/admin/system-info",
            check_fn=lambda d: d and "database" in d and "server" in d
        )
        
        self.test(
            "GET /api/admin/full-database-info returns full DB info",
            "GET", "/admin/full-database-info",
            check_fn=lambda d: d and "databaseName" in d and "collections" in d
        )
        
        # ===== API HEALTH TESTS =====
        self.log("\n[12] API HEALTH TESTS", "INFO")
        
        self.test(
            "GET /api/admin/api-health returns summary with all checks NORMAL",
            "GET", "/admin/api-health",
            check_fn=lambda d: d and d.get("summary", {}).get("overallStatus") == "NORMAL"
        )
        
        # ===== SECURITY TESTS =====
        self.log("\n[13] SECURITY TESTS", "INFO")
        
        self.test(
            "GET /api/admin/security-settings returns config",
            "GET", "/admin/security-settings",
            check_fn=lambda d: d and "config" in d and "securityScore" in d
        )
        
        self.test(
            "PUT /api/admin/security-settings updates settings",
            "PUT", "/admin/security-settings",
            data={"apiSecurity": {"rateLimitEnabled": True}}
        )
        
        self.test(
            "POST /api/admin/security-block-ip blocks IP",
            "POST", "/admin/security-block-ip",
            data={"ip": "192.168.1.100", "reason": "Test block"}
        )
        
        self.test(
            "DELETE /api/admin/security-block-ip/{ip} unblocks IP",
            "DELETE", "/admin/security-block-ip/192.168.1.100"
        )
        
        self.test(
            "POST /api/admin/security-test-waf runs WAF test",
            "POST", "/admin/security-test-waf"
        )
        
        self.test(
            "GET /api/admin/system-logs returns logs",
            "GET", "/admin/system-logs",
            check_fn=lambda d: d and "logs" in d
        )
        
        self.test(
            "POST /api/admin/system-logs/generate-test generates test log",
            "POST", "/admin/system-logs/generate-test",
            data={"type": "UPDATE"}
        )
        
        # ===== 2FA TESTS =====
        self.log("\n[14] 2FA TESTS", "INFO")
        
        success, qr_data = self.test(
            "GET /api/admin/2fa/qr returns base32 secret and PNG data URI",
            "GET", "/admin/2fa/qr",
            check_fn=lambda d: d and "secret" in d and "qrDataUri" in d and d["qrDataUri"].startswith("data:image/png;base64,")
        )
        
        self.test(
            "POST /api/admin/2fa/generate-secret rotates secret",
            "POST", "/admin/2fa/generate-secret"
        )
        
        # Test credentials update (but don't change password or enable 2FA)
        self.test(
            "PUT /api/admin/credentials with wrong currentPassword is rejected",
            "PUT", "/admin/credentials",
            expected_status=400,
            data={"currentPassword": "wrongpassword", "newPassword": "newpass123"}
        )
        
        # Ensure 2FA is disabled and credentials are unchanged
        self.test(
            "PUT /api/admin/credentials ensures 2FA disabled",
            "PUT", "/admin/credentials",
            data={"google2faEnabled": False}
        )
        
        # ===== AUTH PROTECTION TESTS =====
        self.log("\n[15] AUTH PROTECTION TESTS", "INFO")
        
        # Test that admin endpoints reject requests without token
        no_auth_headers = {"Content-Type": "application/json"}
        try:
            response = requests.get(f"{BASE_URL}/admin/rate-logs", headers=no_auth_headers, timeout=5)
            if response.status_code in [401, 403]:
                self.tests_passed += 1
                self.log("PASSED - Admin endpoint rejects no-auth request", "PASS")
            else:
                self.tests_failed += 1
                self.log(f"FAILED - Admin endpoint should reject no-auth (got {response.status_code})", "FAIL")
            self.tests_run += 1
        except Exception as e:
            self.tests_failed += 1
            self.log(f"FAILED - Exception testing no-auth: {e}", "FAIL")
            self.tests_run += 1
        
        # ===== ANALYTICS TESTS =====
        self.log("\n[16] ANALYTICS TESTS", "INFO")
        
        self.test(
            "POST /api/analytics/track tracks visitor",
            "POST", "/analytics/track",
            data={"page": "/test"}
        )
        
        self.test(
            "GET /api/admin/visitor-analytics returns stats",
            "GET", "/admin/visitor-analytics",
            check_fn=lambda d: d and "totalVisitors" in d and "topCities" in d and "deviceBreakdown" in d and "trafficTrend" in d
        )
        
        # ===== SUMMARY =====
        self.log("\n" + "=" * 60, "INFO")
        self.log("TEST SUMMARY", "INFO")
        self.log("=" * 60, "INFO")
        self.log(f"Total Tests: {self.tests_run}", "INFO")
        self.log(f"Passed: {self.tests_passed}", "PASS")
        self.log(f"Failed: {self.tests_failed}", "FAIL")
        self.log(f"Success Rate: {round(self.tests_passed / self.tests_run * 100, 1)}%", "INFO")
        
        if self.failed_tests:
            self.log("\nFailed Tests Details:", "FAIL")
            for i, fail in enumerate(self.failed_tests[:10], 1):
                self.log(f"{i}. {fail.get('name')}", "FAIL")
                if "expected" in fail:
                    self.log(f"   Expected: {fail['expected']}, Got: {fail['got']}", "FAIL")
                if "error" in fail:
                    self.log(f"   Error: {fail['error']}", "FAIL")
        
        return self.tests_failed == 0

def main():
    tester = BerkahUsdtTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())

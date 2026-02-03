import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';

class VoterProfileScreen extends StatefulWidget {
  const VoterProfileScreen({super.key});

  @override
  State<VoterProfileScreen> createState() => _VoterProfileScreenState();
}

class _VoterProfileScreenState extends State<VoterProfileScreen> {
  // Shared Palette
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color bgCanvas = Color(0xFFF9FAFB);
  static const Color textMain = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color cardBorder = Color(0xFFE5E7EB);
  static const Color successGreen = Color(0xFF059669);
  static const Color successBg = Color(0xFFECFDF5);
  static const Color dangerRed = Color(0xFFDC2626);

  Map<String, dynamic>? userData;
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId');

      if (userId == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'User not logged in';
        });
        return;
      }

      // Dynamic Base URL Logic (copied from LoginScreen for simplicity)
      String baseUrl = 'http://localhost:8080';
      if (!kIsWeb) {
        try {
          if (Platform.isAndroid) {
            baseUrl = 'http://10.0.2.2:8080';
          }
        } catch (e) {
          // Fallback
        }
      }

      final url = Uri.parse('$baseUrl/api/auth/$userId');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        setState(() {
          userData = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
          errorMessage = 'Failed to load profile: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Error: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgCanvas,
      appBar: AppBar(
        backgroundColor: bgCanvas,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          color: textMain,
          onPressed: () => Navigator.maybePop(context),
        ),
        centerTitle: true,
        title: const Text(
          "PROFILE",
          style: TextStyle(
            color: brandPrimary,
            fontSize: 13,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
          ),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage != null
              ? Center(child: Text(errorMessage!))
              : Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 500),
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Profile Avatar Section
                          Stack(
                            alignment: Alignment.bottomRight,
                            children: [
                              CircleAvatar(
                                radius: 54,
                                backgroundColor: brandPrimary.withOpacity(0.1),
                                child: const Icon(
                                  Icons.person_rounded,
                                  size: 54,
                                  color: brandPrimary,
                                ),
                              ),
                              // Removing camera icon as user can't change it
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            userData?['fullName'] ?? 'User',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: textMain,
                            ),
                          ),
                          const SizedBox(height: 8),
                          _buildStatusChip(),
                          const SizedBox(height: 32),

                          // Info Sections
                          _infoCard(
                            title: 'Personal Information',
                            children: [
                              _InfoRow('Email', userData?['email'] ?? '-'),
                              _InfoRow('Phone', userData?['phone'] ?? '-'),
                              _InfoRow('Date of Birth', userData?['dateOfBirth'] ?? '-'),
                              _InfoRow(
                                'Gender',
                                userData?['gender'] ?? '-',
                                isLast: true,
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _infoCard(
                            title: 'Address',
                            children: [
                              _InfoRow(
                                'Residential',
                                userData?['address'] ?? '-',
                                isLast: true,
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _infoCard(
                            title: 'Voter Details',
                            children: [
                              _InfoRow('Voter ID', userData?['userId'] ?? '-'),
                              _InfoRow(
                                'Status',
                                userData?['status'] ?? 'Active',
                                isLast: true,
                              ),
                            ],
                          ),
                          const SizedBox(height: 32),

                          // Actions
                          // Removed Edit Profile since user can't change
                          const SizedBox(height: 12),
                          _buildActionButton(
                            label: 'Logout',
                            icon: Icons.logout_rounded,
                            onPressed: () {
                              // Clear prefs if needed
                              Navigator.pushReplacementNamed(context, '/login');
                            },
                            isPrimary: true,
                            color: dangerRed,
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ),
    );
  }

  Widget _buildStatusChip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: successBg,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: successGreen.withOpacity(0.2)),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified_user_rounded, size: 14, color: successGreen),
          SizedBox(width: 6),
          Text(
            'VERIFIED VOTER',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: successGreen),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required IconData icon,
    required VoidCallback onPressed,
    required bool isPrimary,
    Color? color,
  }) {
    final themeColor = color ?? brandPrimary;
    return SizedBox(
      width: double.infinity,
      child: isPrimary
          ? ElevatedButton.icon(
              onPressed: onPressed,
              icon: Icon(icon, size: 20, color: Colors.white),
              label: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: themeColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
            )
          : OutlinedButton.icon(
              onPressed: onPressed,
              icon: Icon(icon, size: 20, color: themeColor),
              label: Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: themeColor)),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: themeColor.withOpacity(0.5)),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
    );
  }

  static Widget _infoCard({required String title, required List<Widget> children}) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
        color: Colors.white,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 20, top: 16, bottom: 8),
            child: Text(
              title.toUpperCase(),
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: textSecondary, letterSpacing: 1),
            ),
          ),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isLast;

  const _InfoRow(this.label, this.value, {this.isLast = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: Text(
                  label,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280), fontWeight: FontWeight.w500),
                ),
              ),
              Expanded(
                flex: 4,
                child: Text(
                  value,
                  textAlign: TextAlign.right,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF111827)),
                ),
              ),
            ],
          ),
        ),
        if (!isLast) const Divider(height: 1, indent: 20, endIndent: 20, color: Color(0xFFF3F4F6)),
      ],
    );
  }
}
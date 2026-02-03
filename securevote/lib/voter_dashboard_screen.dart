import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class VoterDashboardScreen extends StatefulWidget {
  const VoterDashboardScreen({super.key});

  @override
  State<VoterDashboardScreen> createState() => _VoterDashboardScreenState();
}

class _VoterDashboardScreenState extends State<VoterDashboardScreen> {
  // Shared Palette (Consistent with Login/Registration)
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color bgCanvas = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color cardBorder = Color(0xFFE5E7EB);
  static const Color successGreen = Color(0xFF059669);
  static const Color successBg = Color(0xFFECFDF5);

  List<dynamic> elections = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchElections();
  }

  Future<void> _fetchElections() async {
    try {
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

      final url = Uri.parse('$baseUrl/api/elections/live');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        setState(() {
          elections = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
          errorMessage = 'Failed to load elections: ${response.statusCode}';
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
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        automaticallyImplyLeading:
            false, // Hides back button if coming from login
        title: const Text(
          "VOTE.GOV",
          style: TextStyle(
            color: brandPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w800,
            letterSpacing: 2.0,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: GestureDetector(
              onTap: () => Navigator.pushNamed(context, '/profile'),
              child: const Icon(Icons.person, size: 20, color: brandPrimary),
            ),
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Welcome Section
                const Text(
                  'Welcome, Voter',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: textMain,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: successBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: successGreen.withOpacity(0.2),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(
                            Icons.check_circle,
                            size: 14,
                            color: successGreen,
                          ),
                          SizedBox(width: 6),
                          Text(
                            'Identity Verified',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: successGreen,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'STATUS: ACTIVE',
                      style: TextStyle(
                        fontSize: 12,
                        color: textSecondary.withOpacity(0.8),
                        fontFamily: 'Monospace',
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // 2. Quick Stats Row
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        label: 'Active Ballots',
                        value: isLoading ? '-' : '${elections.length}',
                        icon: Icons.how_to_vote_outlined,
                        isPrimary: true,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(
                        label: 'Voted History',
                        value: '0',
                        icon: Icons.history,
                        isPrimary: false,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 40),

                // 3. Active Elections Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Active Ballots',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: textMain,
                      ),
                    ),
                    if (isLoading)
                      const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                  ],
                ),

                const SizedBox(height: 16),

                // 4. Election Cards List
                if (errorMessage != null)
                   Text(errorMessage!, style: const TextStyle(color: Colors.red)),

                if (!isLoading && elections.isEmpty)
                   const Text("No active elections found."),

                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: elections.length,
                  itemBuilder: (context, index) {
                    final election = elections[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _buildElectionCard(
                        context,
                        title: election['title'] ?? 'Unknown Election',
                        date: 'Due by ${election['endTime']?.substring(0, 10) ?? 'Soon'}',
                        tag: 'OPEN',
                        description: election['description'] ?? 'No description provided.',
                      ),
                    );
                  },
                ),

                const SizedBox(height: 48),

                // 5. Security Footer
                Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.lock_outline,
                        size: 16,
                        color: textSecondary.withOpacity(0.5),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'SECURE CONNECTION | AES-256',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                          color: textSecondary.withOpacity(0.5),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String label,
    required String value,
    required IconData icon,
    required bool isPrimary,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isPrimary ? brandPrimary : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: isPrimary ? null : Border.all(color: cardBorder),
        boxShadow: isPrimary
            ? [
                BoxShadow(
                  color: brandPrimary.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: isPrimary ? Colors.white70 : textSecondary,
            size: 20,
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isPrimary ? Colors.white : textMain,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isPrimary ? Colors.white70 : textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildElectionCard(
    BuildContext context, {
    required String title,
    required String date,
    required String tag,
    required String description,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: brandPrimary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    tag,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: brandPrimary,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: textSecondary.withOpacity(0.5),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textMain,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              date,
              style: const TextStyle(
                fontSize: 13,
                color: textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
             Text(
              description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                color: textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pushNamed(context, '/election'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: brandPrimary,
                  side: const BorderSide(color: cardBorder),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text(
                  'View & Vote',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


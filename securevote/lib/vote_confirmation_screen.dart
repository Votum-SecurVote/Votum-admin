import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class VoteConfirmationScreen extends StatelessWidget {
  final String candidateName;
  final String party;

  const VoteConfirmationScreen({
    super.key,
    this.candidateName = "Senator Alexandra Reed",
    this.party = "Democratic Party",
  });

  // Colors
  static const Color brandPrimary = Color(0xFF1A434E);
  static const Color textMain = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color successGreen = Color(0xFF059669);
  static const Color bgCanvas = Color(0xFFF9FAFB);
  static const Color cardBorder = Color(0xFFE5E7EB);

  final String receiptHash =
      '8f3a2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e';

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false, // 🔒 Disable back
      child: Scaffold(
        backgroundColor: bgCanvas,
        body: SafeArea(
          child: Column(
            children: [
              // 🔽 SCROLLABLE CONTENT (FIXES OVERFLOW)
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                  child: Column(
                    children: [
                      // Success Icon
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.verified_rounded,
                          size: 64,
                          color: successGreen,
                        ),
                      ),
                      const SizedBox(height: 20),

                      const Text(
                        "Vote Successfully Submitted",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: textMain,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "Your ballot is encrypted and permanently recorded.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: textSecondary),
                      ),

                      const SizedBox(height: 32),

                      // RECEIPT CARD
                      _buildReceiptCard(context),
                    ],
                  ),
                ),
              ),

              // 🔽 FIXED BOTTOM BUTTON
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamedAndRemoveUntil(
                        context,
                        '/dashboard',
                        (route) => false,
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: brandPrimary,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      "Return to Dashboard",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ================= RECEIPT CARD =================

  Widget _buildReceiptCard(BuildContext context) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 420),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: const BoxDecoration(
              color: brandPrimary,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: const Text(
              "DIGITAL VOTE RECEIPT",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
                color: Colors.white,
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Text(
                  candidateName,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: textMain,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  party.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 12,
                    color: textSecondary,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.6,
                  ),
                ),

                const SizedBox(height: 24),
                const Divider(),
                const SizedBox(height: 16),

                _infoRow("Election", "2024 General"),
                _infoRow("Date", "Oct 24, 2024"),
                _infoRow("Time", "09:41 AM"),

                const SizedBox(height: 20),

                // HASH BOX
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: bgCanvas,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "RECEIPT HASH",
                            style: TextStyle(
                              fontSize: 10,
                              color: textSecondary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              Clipboard.setData(
                                ClipboardData(text: receiptHash),
                              );
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text("Hash copied")),
                              );
                            },
                            child: const Text(
                              "COPY",
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: brandPrimary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      SelectableText(
                        receiptHash,
                        maxLines: null,
                        style: const TextStyle(
                          fontFamily: 'Courier',
                          fontSize: 11,
                          height: 1.4,
                          color: textMain,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: textSecondary)),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: textMain,
            ),
          ),
        ],
      ),
    );
  }
}

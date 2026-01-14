import 'package:flutter/material.dart';
import 'package:securevote/election_details_screen.dart';
import 'package:securevote/mfa_screen.dart';
import 'package:securevote/voter_dashboard_screen.dart';
import 'package:securevote/voter_registration_screen.dart';
import 'login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EVotingApp());
}

class EVotingApp extends StatelessWidget {
  const EVotingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Secure E-Voting System',
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: Colors.white,
        fontFamily: 'PublicSans',
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/mfa': (context) => const MFAScreen(),
        '/register': (context) => const VoterRegistrationScreen(),
        '/dashboard': (context) => const VoterDashboardScreen(),
        '/election': (context) => const ElectionDetailsScreen(),
      },
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();

    // Simulate app initialization
    Future.delayed(const Duration(seconds: 3), () {
      Navigator.pushReplacementNamed(context, '/login');
    });
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF2C5F81);

    return Scaffold(
      body: Column(
        children: [
          /// Main content
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  /// Logo + circles
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 192,
                        height: 192,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: primaryColor.withOpacity(0.05),
                          ),
                        ),
                      ),
                      Container(
                        width: 128,
                        height: 128,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: primaryColor.withOpacity(0.1),
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.verified_user,
                          size: 84,
                          color: primaryColor,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 40),

                  /// Title
                  const Text(
                    'Secure E-Voting\nSystem',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: primaryColor,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      height: 1.2,
                    ),
                  ),

                  const SizedBox(height: 16),

                  Container(
                    width: 48,
                    height: 4,
                    decoration: BoxDecoration(
                      color: primaryColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ],
              ),
            ),
          ),

          /// Footer
          Padding(
            padding: const EdgeInsets.only(bottom: 64),
            child: Column(
              children: const [
                SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: primaryColor,
                  ),
                ),
                SizedBox(height: 12),
                Text(
                  'INITIALIZING SECURE PROTOCOL',
                  style: TextStyle(
                    fontSize: 11,
                    letterSpacing: 1.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2C5F81),
                  ),
                ),
                SizedBox(height: 32),
                Text(
                  'National Election Authority • v1.0.0',
                  style: TextStyle(fontSize: 14, color: Color(0xFF6A7881)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

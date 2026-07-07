import 'dart:convert';
import 'package:http/http.dart' as http;

class VoiceService {
  static final VoiceService _instance = VoiceService._internal();
  factory VoiceService() => _instance;
  VoiceService._internal();

  bool _isListening = false;
  bool get isListening => _isListening;

  // Toggle record and simulate capturing local clinical voice speech input
  Future<String?> toggleSpeechToText() async {
    if (_isListening) {
      _isListening = false;
      // Simulate speech captured: "We just logged 500 boxes of Paracetamol 500mg"
      return "Log 500 units of Paracetamol 500mg at PHC Rampur";
    } else {
      _isListening = true;
      // Emulate starting audio streams and hotword detection
      return null;
    }
  }

  // Dispatch speech transcription to the cloud parser API
  Future<Map<String, dynamic>?> processVoiceTranscript({
    required String serverUrl,
    required String transcript,
    required String facilityId,
    required String operatorEmail,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$serverUrl/api/voice'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'transcript': transcript,
          'facilityId': facilityId,
          'operatorEmail': operatorEmail,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Voice transcription cloud service error: $e');
    }
    return null;
  }
}

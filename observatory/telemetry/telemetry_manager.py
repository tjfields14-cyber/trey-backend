class TelemetryManager:

    def track(self, metric, value):

        print(f"[TELEMETRY] {metric}: {value}")

telemetry_manager = TelemetryManager()

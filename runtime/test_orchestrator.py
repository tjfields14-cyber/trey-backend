from runtime.orchestration.runtime_orchestrator import runtime_orchestrator

runtime_orchestrator.register("backend")
runtime_orchestrator.register("portal")

print(runtime_orchestrator.status())

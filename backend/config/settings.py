from pydantic import BaseSettings
import backend.psi_wrapper as psi_wrapper

class Settings(BaseSettings):
    server_key: str = "your-secret-key-here"
    malware_signatures: list[str] = [
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
        "3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278",
        "8c3d4a0f94b252c7859a96fd69a5711b5a4e599afc857c8b4f414b3fb6a095b9",
        "2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3"
    ]
    server_preprocessed: str = "server_preprocessed_data_placeholder"

settings = Settings()
from backend.psi_wrapper import get_psi_wrapper

wrapper = get_psi_wrapper()
SERVER_PREPROCESSED = wrapper.server_preprocess(settings.malware_signatures, settings.server_key)
"""服务层模块，提供业务逻辑操作"""

from backend.services.user_service import (
    get_user,
    get_user_by_email,
    get_user_by_username,
    get_users,
    create_user,
    authenticate_user,
    update_user,
    deactivate_user
)

from backend.services.scan_service import (
    save_upload_file,
    create_scan_record,
    update_scan_status,
    update_scan_result,
    get_scan_records,
    get_scan_record,
    scan_file
)

from backend.services.detection_service import (
    detect_malware,
    analyze_hashes
)
-- 자동 생성 시드 (malgn-studio)
DELETE FROM task;
DELETE FROM stage;
DELETE FROM board_meta;
DELETE FROM wbs_item;

INSERT INTO board_meta (id, project_name, last_updated) VALUES (1, '맑은스튜디오', '2026-06-18');

INSERT INTO stage (id,no,name,emoji,summary,weight,progress,sort) VALUES ('step-1','Step 1','기반·인프라','🏗️','멀티앱 골격·인증·프로젝트/워크스페이스·RBAC·스튜디오 셸',10,0,0);
INSERT INTO stage (id,no,name,emoji,summary,weight,progress,sort) VALUES ('step-2','Step 2','인제스트·그라운딩','🔎','문서/PPT/웹/영상 파싱·정규화·청킹·RAG 인덱싱·출처(citation)',18,0,1);
INSERT INTO stage (id,no,name,emoji,summary,weight,progress,sort) VALUES ('step-3','Step 3','AI 생성 엔진','🧠','8종 산출물 생성·오케스트레이션·교수설계(ID) 정렬',22,0,2);
INSERT INTO stage (id,no,name,emoji,summary,weight,progress,sort) VALUES ('step-4','Step 4','HITL 검수','✅','초안→검수중→승인/반려 상태머신·코멘트·재생성',8,0,3);
INSERT INTO stage (id,no,name,emoji,summary,weight,progress,sort) VALUES ('step-5','Step 5','발행·표준 패키징','📦','자사 LMS 네이티브 발행·SCORM 1.2/2004·xAPI',12,0,4);
INSERT INTO stage (id,no,name,emoji,summary,weight,progress,sort) VALUES ('step-6','Step 6','스킬·개인화','🎯','스킬 태깅→택소노미→적응형→생성형 변주',12,0,5);
INSERT INTO stage (id,no,name,emoji,summary,weight,progress,sort) VALUES ('step-7','Step 7','미디어 연동','🎬','영상·오디오 외부 API 어댑터·비동기 렌더 잡',8,0,6);
INSERT INTO stage (id,no,name,emoji,summary,weight,progress,sort) VALUES ('step-8','Step 8','운영자 콘솔·LMS','🛠️','admin(회원·과금·권한)·lms(수강·진도·평가)',10,0,7);
INSERT INTO stage (id,no,name,emoji,summary,weight,progress,sort) VALUES ('step-9','Step 9','QA·배포·인프라','🧪','테스트·보안·배포·관측 (표시용, 전체 진척 미반영)',0,0,8);

INSERT INTO task (id,stage_id,grp,title,status,owner,note,target_date,completion_date,href,sort) VALUES ('1-1','step-1','기반','멀티앱 레포 스캐폴드(studio/admin/api/lms)','pending','—',NULL,NULL,NULL,NULL,0);
INSERT INTO task (id,stage_id,grp,title,status,owner,note,target_date,completion_date,href,sort) VALUES ('1-2','step-1','기반','인증·세션·RBAC·프로젝트/워크스페이스','pending','—',NULL,NULL,NULL,NULL,1);
INSERT INTO task (id,stage_id,grp,title,status,owner,note,target_date,completion_date,href,sort) VALUES ('2-1','step-2','인제스트','문서/PPT 파서 + 청킹·정규화','pending','—',NULL,NULL,NULL,NULL,2);
INSERT INTO task (id,stage_id,grp,title,status,owner,note,target_date,completion_date,href,sort) VALUES ('2-2','step-2','인제스트','임베딩·벡터스토어 인덱싱 + 출처 매핑','pending','—',NULL,NULL,NULL,NULL,3);
INSERT INTO task (id,stage_id,grp,title,status,owner,note,target_date,completion_date,href,sort) VALUES ('3-1','step-3','생성','생성 오케스트레이션 + 요약·슬라이드·퀴즈','pending','—',NULL,NULL,NULL,NULL,4);
INSERT INTO task (id,stage_id,grp,title,status,owner,note,target_date,completion_date,href,sort) VALUES ('3-2','step-3','생성','학습목표·블룸 정렬·평가-목표 매트릭스','pending','—',NULL,NULL,NULL,NULL,5);

-- WBS 간트(wbs_item) — 분석·기획·설계 단계 (2026-06-17~18 수행분, 모두 완료). wbsData.ts와 일치.
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (1,'시장·경쟁','경쟁 환경 분석 (글로벌·국내 LMS/LXP AI 빌더)','service-planner','2026-06-17','2026-06-17',100,'01-COMPETITION 정본',NULL,0);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (1,'시장·경쟁','포지셔닝·차별화 도출 (4대 해자)','service-planner','2026-06-17','2026-06-17',100,'02-STRATEGY',NULL,1);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'서비스 기획','서비스 개요·비전 (00)','planner','2026-06-17','2026-06-17',100,NULL,NULL,2);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'서비스 기획','차별화 전략 (02)','planner','2026-06-17','2026-06-17',100,NULL,NULL,3);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'서비스 기획','기능 정의·범위 MVP 매트릭스 (03)','planner','2026-06-17','2026-06-17',100,NULL,NULL,4);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'도메인 기획','인제스트·그라운딩 기획 (04)','planner','2026-06-17','2026-06-17',100,NULL,NULL,5);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'도메인 기획','AI 생성 엔진 기획 (05)','planner','2026-06-17','2026-06-17',100,NULL,NULL,6);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'도메인 기획','미디어 연동 기획 (06)','planner','2026-06-17','2026-06-17',100,NULL,NULL,7);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'도메인 기획','스킬·개인화 기획 (07)','planner','2026-06-17','2026-06-17',100,NULL,NULL,8);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'도메인 기획','발행·LMS 기획 (08)','planner','2026-06-17','2026-06-17',100,NULL,NULL,9);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'로드맵·NFR','로드맵·WBS 9단계 (11)','pms-developer','2026-06-17','2026-06-17',100,NULL,NULL,10);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (2,'로드맵·NFR','비기능 요구 NFR (12)','planner','2026-06-17','2026-06-17',100,NULL,NULL,11);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (3,'시스템 설계','기술 아키텍처·AI 파이프라인 (09)','architect','2026-06-17','2026-06-17',100,NULL,NULL,12);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (3,'시스템 설계','통합 데이터 모델 ERD (09)','dba','2026-06-17','2026-06-17',100,NULL,NULL,13);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (3,'경험 설계','IA·사용자 플로우·화면 (10)','ux-designer','2026-06-17','2026-06-17',100,NULL,NULL,14);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (3,'교수설계','품질 정본 (블룸·정합·8종 루브릭·HITL)','instructional-designer','2026-06-18','2026-06-18',100,'planning/quality',NULL,15);
INSERT INTO wbs_item (step,grp,name,owner,"start","end",progress,note,href,sort) VALUES (3,'조직 설계','에이전트 팀·성장 시스템 설계','growth-keeper','2026-06-18','2026-06-18',100,NULL,NULL,16);

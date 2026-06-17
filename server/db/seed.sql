-- 자동 생성 시드 (malgn-studio)
DELETE FROM task;
DELETE FROM stage;
DELETE FROM board_meta;

INSERT INTO board_meta (id, project_name, last_updated) VALUES (1, '맑은스튜디오', '2026-06-17');

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

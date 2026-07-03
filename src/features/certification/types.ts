export type CertificationJavaEnvelope<T> = {
  code?: string;
  data?: T | null;
  msg?: string;
  success?: boolean;
};

export type CertificationApplyUrlResponse = {
  regInviteLink?: unknown;
  respCode?: unknown;
  respMsg?: unknown;
  respTraceNum?: unknown;
  signNum?: unknown;
};

export type CertificationMemberInfo = {
  isRealNameAuth?: unknown;
  isWithdraw?: unknown;
  memberName?: unknown;
  name?: unknown;
  phone?: unknown;
};

export type CertificationApplyUrlData = {
  modules: {
    raw: CertificationApplyUrlResponse;
  };
  view: {
    applyUrl: string;
    message: string;
  };
};

export type CertificationMemberInfoData = {
  modules: {
    member: CertificationMemberInfo;
  };
  view: {
    memberName: string;
    reason: string;
    success: boolean;
  };
};
